import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthProvider';
import Swal from 'sweetalert2';

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
            setTasks(response.data.tasks);
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
                await axios.post(`${import.meta.env.VITE_API_URL}/api/tasks`, {
                    ...newTask,
                    userEmail: user.email,
                    userName: user.displayName,
                    userPhoto: user.photoURL,
                });
                setNewTask({ title: '', description: '', category: 'To-Do' });
            }
            fetchTasks();
        } catch (error) {
            setError('Failed to save task');
        }
    };

    const handleDelete = async (taskId) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444', // red-500
                cancelButtonColor: '#6b7280', // gray-500
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel',
                background: '#ffffff',
                borderRadius: '0.5rem',
                customClass: {
                    popup: 'rounded-lg',
                    title: 'text-gray-900 text-xl font-medium',
                    htmlContainer: 'text-gray-600',
                    confirmButton: 'rounded-lg text-sm font-medium px-4 py-2',
                    cancelButton: 'rounded-lg text-sm font-medium px-4 py-2'
                }
            });

            if (result.isConfirmed) {
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/tasks/${taskId}`);
                fetchTasks();

                // Show success message
                await Swal.fire({
                    title: 'Deleted!',
                    text: 'Your task has been deleted.',
                    icon: 'success',
                    confirmButtonColor: '#3b82f6', // blue-500
                    customClass: {
                        popup: 'rounded-lg',
                        title: 'text-gray-900 text-xl font-medium',
                        htmlContainer: 'text-gray-600',
                        confirmButton: 'rounded-lg text-sm font-medium px-4 py-2'
                    }
                });
            }
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: 'Failed to delete task',
                icon: 'error',
                confirmButtonColor: '#3b82f6', // blue-500
                customClass: {
                    popup: 'rounded-lg',
                    title: 'text-gray-900 text-xl font-medium',
                    htmlContainer: 'text-gray-600',
                    confirmButton: 'rounded-lg text-sm font-medium px-4 py-2'
                }
            });
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categories.map(category => (
                    <div key={category} className="bg-gray-50 rounded-xl p-4">
                        <h2 className="text-lg font-medium text-gray-700 mb-4">{category}</h2>
                        <div className="space-y-3">
                            {tasks
                                .filter(task => task.category === category)
                                .map(task => (
                                    <div key={task._id} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                        <h3 className="font-medium text-gray-900 mb-2">{task.title}</h3>
                                        {task.description && (
                                            <p className="text-gray-600 text-sm mb-3">{task.description}</p>
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
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TaskManager;