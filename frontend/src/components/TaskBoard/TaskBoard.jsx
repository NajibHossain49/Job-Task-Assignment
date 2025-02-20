import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthProvider';
import Swal from 'sweetalert2';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';

const TaskManager = () => {
    const { user } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        category: 'To-Do'
    });
    const [editingTask, setEditingTask] = useState(null);
    const [error, setError] = useState('');

    const categories = ['To-Do', 'In Progress', 'Done'];

    useEffect(() => {
        if (user?.email) {
            fetchTasks();
        }
    }, [user]);

    const fetchTasks = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tasks/${user.email}`);
            // Sort tasks based on their order property
            const sortedTasks = response.data.tasks.sort((a, b) => a.order - b.order);
            setTasks(sortedTasks);
        } catch (error) {
            setError('Failed to fetch tasks');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'title' && value.length > 50) return;
        if (name === 'description' && value.length > 200) return;

        if (editingTask) {
            setEditingTask({ ...editingTask, [name]: value });
        } else {
            setNewTask({ ...newTask, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTask) {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/tasks/${editingTask._id}`, editingTask);
                setEditingTask(null);
            } else {
                // Get the highest order number in the category and add 1
                const tasksInCategory = tasks.filter(task => task.category === newTask.category);
                const highestOrder = tasksInCategory.length > 0
                    ? Math.max(...tasksInCategory.map(t => t.order || 0))
                    : -1;

                await axios.post(`${import.meta.env.VITE_API_URL}/api/tasks`, {
                    ...newTask,
                    userEmail: user.email,
                    userName: user.displayName,
                    order: highestOrder + 1
                });
                setNewTask({ title: '', description: '', category: 'To-Do' });
            }
            fetchTasks();
        } catch (error) {
            setError('Failed to save task');

            // Set a timeout to clear the error message after 2 seconds
            setTimeout(() => {
                setError('');
            }, 3000);
        }

    };

    const handleDelete = async (taskId) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel'
            });

            if (result.isConfirmed) {
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/tasks/${taskId}`);
                fetchTasks();

                await Swal.fire({
                    title: 'Deleted!',
                    text: 'Your task has been deleted.',
                    icon: 'success',
                    confirmButtonColor: '#3b82f6'
                });
            }
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: 'Failed to delete task',
                icon: 'error',
                confirmButtonColor: '#3b82f6'
            });
        }
    };

    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const { source, destination } = result;

        // Get tasks in the source category
        const categoryTasks = tasks.filter(task => task.category === destination.droppableId);

        // Create a copy of the tasks array
        const newTasks = Array.from(tasks);

        // Find the task being dragged
        const [movedTask] = newTasks.splice(source.index, 1);

        // Update task's category if it changed
        if (source.droppableId !== destination.droppableId) {
            movedTask.category = destination.droppableId;
        }

        // Insert task at new position
        newTasks.splice(destination.index, 0, movedTask);

        // Update order numbers for all tasks in the affected category
        const updatedTasks = newTasks.map((task, index) => ({
            ...task,
            order: index
        }));

        // Update state immediately for smooth UI
        setTasks(updatedTasks);

        try {
            // Update the moved task's order and category in the database
            await axios.put(`${import.meta.env.VITE_API_URL}/api/tasks/${movedTask._id}`, {
                ...movedTask,
                order: destination.index,
                category: destination.droppableId
            });

            // Update other affected tasks' orders
            const promises = updatedTasks
                .filter(task => task._id !== movedTask._id && task.category === destination.droppableId)
                .map(task =>
                    axios.put(`${import.meta.env.VITE_API_URL}/api/tasks/${task._id}`, {
                        order: task.order
                    })
                );

            await Promise.all(promises);
        } catch (error) {
            setError('Failed to update task order');
            fetchTasks(); // Revert to previous state if update fails
        }
    };

    const startEditing = (task) => {
        setEditingTask(task);
        setNewTask({ title: '', description: '', category: 'To-Do' });
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[400px] text-gray-500">
                Please log in to manage tasks.
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-8">
            {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
                <div className="space-y-4">
                    <input
                        type="text"
                        name="title"
                        placeholder="Task Title"
                        value={editingTask ? editingTask.title : newTask.title}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                        required
                        maxLength={50}
                    />

                    <textarea
                        name="description"
                        placeholder="Task Description (optional)"
                        value={editingTask ? editingTask.description : newTask.description}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all min-h-[100px]"
                        maxLength={200}
                    />

                    <div className="flex flex-col sm:flex-row gap-4">
                        <select
                            name="category"
                            value={editingTask ? editingTask.category : newTask.category}
                            onChange={handleInputChange}
                            className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all bg-white"
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>

                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex-shrink-0"
                        >
                            {editingTask ? 'Update Task' : 'Add Task'}
                        </button>
                    </div>
                </div>
            </form>

            {/* Task Columns */}
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {categories.map(category => (
                        <div key={category} className="bg-gray-50 rounded-xl p-4">
                            <h2 className="text-lg font-medium text-gray-700 mb-4">{category}</h2>
                            <Droppable droppableId={category}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`space-y-3 min-h-[200px] transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        {tasks
                                            .filter(task => task.category === category)
                                            .sort((a, b) => a.order - b.order)
                                            .map((task, index) => (
                                                <Draggable
                                                    key={task._id}
                                                    draggableId={task._id}
                                                    index={index}
                                                >
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`bg-white rounded-lg p-4 shadow-sm transition-all ${snapshot.isDragging
                                                                ? 'shadow-lg ring-2 ring-blue-400'
                                                                : 'hover:shadow-md'
                                                                }`}
                                                        >
                                                            <h3 className="font-medium text-gray-900 mb-2">
                                                                {task.title}
                                                            </h3>
                                                            {task.description && (
                                                                <p className="text-gray-600 text-sm mb-3">
                                                                    {task.description}
                                                                </p>
                                                            )}

                                                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                                                                <span className="text-xs text-gray-400">
                                                                    {new Date(task.timestamp).toLocaleString()}
                                                                </span>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => startEditing(task)}
                                                                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(task._id)}
                                                                        className="px-3 py-1 text-sm text-red-500 hover:text-red-700 transition-colors"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
};

export default TaskManager;