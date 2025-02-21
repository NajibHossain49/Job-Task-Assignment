import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthProvider';
import Swal from 'sweetalert2';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const TaskManager = () => {
    const { user } = useContext(AuthContext);
    const queryClient = useQueryClient();
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        category: 'To-Do'
    });
    const [editingTask, setEditingTask] = useState(null);
    const [error, setError] = useState('');

    const categories = ['To-Do', 'In Progress', 'Done'];

    // Fetch tasks query
    const { data: tasks = [], isLoading } = useQuery({
        queryKey: ['tasks', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tasks/${user.email}`);
            return response.data.tasks.sort((a, b) => a.order - b.order);
        },
        enabled: !!user?.email,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * (attemptIndex + 1), 3000)
    });

    // Add/Update task mutation
    const taskMutation = useMutation({
        mutationFn: async (taskData) => {
            if (taskData._id) {
                // Update existing task
                return axios.put(`${import.meta.env.VITE_API_URL}/api/tasks/${taskData._id}`, taskData);
            } else {
                // Create new task
                return axios.post(`${import.meta.env.VITE_API_URL}/api/tasks`, taskData);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['tasks', user?.email]);
            toast.success(editingTask ? 'Task updated successfully!' : 'Task added successfully!');
            setNewTask({ title: '', description: '', category: 'To-Do' });
            setEditingTask(null);
        },
        onError: () => {
            toast.error('Failed to save task. Please try again.');
        }
    });

    // Delete task mutation
    const deleteMutation = useMutation({
        mutationFn: (taskId) => axios.delete(`${import.meta.env.VITE_API_URL}/api/tasks/${taskId}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['tasks', user?.email]);
            toast.success('Task deleted successfully!');
        },
        onError: () => {
            toast.error('Failed to delete task. Please try again.');
        }
    });

    // Update task order mutation
    const updateOrderMutation = useMutation({
        mutationFn: async ({ taskId, updates, affectedTasks }) => {
            const promises = [
                axios.put(`${import.meta.env.VITE_API_URL}/api/tasks/${taskId}`, updates),
                ...affectedTasks.map(task =>
                    axios.put(`${import.meta.env.VITE_API_URL}/api/tasks/${task._id}`, {
                        order: task.order
                    })
                )
            ];
            return Promise.all(promises);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['tasks', user?.email]);
        },
        onError: () => {
            toast.error('Failed to update task order');
            queryClient.invalidateQueries(['tasks', user?.email]);
        }
    });

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
        const taskData = editingTask || {
            ...newTask,
            userEmail: user.email,
            userName: user.displayName,
            order: tasks.filter(task => task.category === newTask.category).length
        };
        taskMutation.mutate(taskData);
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
                await deleteMutation.mutateAsync(taskId);
            }
        } catch (error) {
            toast.error('Failed to delete task');
        }
    };

    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const { source, destination } = result;
        const newTasks = Array.from(tasks);
        const [movedTask] = newTasks.splice(source.index, 1);

        if (source.droppableId !== destination.droppableId) {
            movedTask.category = destination.droppableId;
        }

        newTasks.splice(destination.index, 0, movedTask);

        const updatedTasks = newTasks.map((task, index) => ({
            ...task,
            order: index
        }));

        // Optimistically update the UI
        queryClient.setQueryData(['tasks', user?.email], updatedTasks);

        // Prepare the updates
        const updates = {
            order: destination.index,
            category: destination.droppableId
        };

        const affectedTasks = updatedTasks
            .filter(task => task._id !== movedTask._id && task.category === destination.droppableId);

        updateOrderMutation.mutate({
            taskId: movedTask._id,
            updates,
            affectedTasks
        });
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
                            disabled={taskMutation.isPending}
                        >
                            {taskMutation.isPending ? 'Saving...' : (editingTask ? 'Update Task' : 'Add Task')}
                        </button>
                    </div>
                </div>
            </form>

            {isLoading ? (
                <div className="flex items-center justify-center min-h-[200px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            ) : (
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
                                            className={`space-y-3 min-h-[200px] transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
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
                                                                className={`bg-white rounded-lg p-4 shadow-sm transition-all ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-400' : 'hover:shadow-md'}`}
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
                                                                            disabled={taskMutation.isPending}
                                                                        >
                                                                            Edit
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDelete(task._id)}
                                                                            className="px-3 py-1 text-sm text-red-500 hover:text-red-700 transition-colors"
                                                                            disabled={deleteMutation.isPending}
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
            )}
        </div>
    );
};

export default TaskManager;