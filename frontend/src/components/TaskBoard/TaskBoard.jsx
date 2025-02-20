import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthProvider';

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
                    userPhoto: user.photoURL
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
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/tasks/${taskId}`);
            fetchTasks();
        } catch (error) {
            setError('Failed to delete task');
        }
    };

    const startEditing = (task) => {
        setEditingTask(task);
        setNewTask({ title: '', description: '', category: 'To-Do' });
    };

    if (!user) {
        return <div className="text-center p-4">Please log in to manage tasks.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="flex items-center gap-4 mb-6">
                <img
                    src={user.photoURL || 'https://via.placeholder.com/40'}
                    alt={user.displayName}
                    className="w-10 h-10 rounded-full"
                />
                <div>
                    <h1 className="text-3xl font-bold">Task Management System</h1>
                    <p className="text-gray-600">{user.displayName} ({user.email})</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="mb-8">
                <div className="flex flex-col gap-4">
                    <input
                        type="text"
                        name="title"
                        placeholder="Task Title"
                        value={editingTask ? editingTask.title : newTask.title}
                        onChange={handleInputChange}
                        className="border p-2 rounded"
                        required
                        maxLength={50}
                    />

                    <textarea
                        name="description"
                        placeholder="Task Description (optional)"
                        value={editingTask ? editingTask.description : newTask.description}
                        onChange={handleInputChange}
                        className="border p-2 rounded"
                        maxLength={200}
                    />

                    <select
                        name="category"
                        value={editingTask ? editingTask.category : newTask.category}
                        onChange={handleInputChange}
                        className="border p-2 rounded"
                    >
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                    >
                        {editingTask ? 'Update Task' : 'Add Task'}
                    </button>
                </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categories.map(category => (
                    <div key={category} className="border rounded p-4">
                        <h2 className="text-xl font-bold mb-4">{category}</h2>
                        <div className="space-y-4">
                            {tasks
                                .filter(task => task.category === category)
                                .map(task => (
                                    <div key={task._id} className="border rounded p-4 bg-white">
                                        <div className="flex items-center gap-2 mb-2">
                                            <img
                                                src={task.userPhoto || 'https://via.placeholder.com/24'}
                                                alt={task.userName}
                                                className="w-6 h-6 rounded-full"
                                            />
                                            <span className="text-sm text-gray-600">{task.userName}</span>
                                        </div>
                                        <h3 className="font-bold">{task.title}</h3>
                                        {task.description && (
                                            <p className="text-gray-600 mt-2">{task.description}</p>
                                        )}
                                        <p className="text-sm text-gray-500 mt-2">
                                            {new Date(task.timestamp).toLocaleString()}
                                        </p>
                                        <div className="flex gap-2 mt-4">
                                            <button
                                                onClick={() => startEditing(task)}
                                                className="bg-yellow-500 text-white py-1 px-3 rounded hover:bg-yellow-600"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(task._id)}
                                                className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                                            >
                                                Delete
                                            </button>
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