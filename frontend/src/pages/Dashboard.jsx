import TaskManager from '../components/TaskBoard/TaskBoard';


const Dashboard = () => {
    return (
        <>
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto py-6 px-4">
                        <h1 className="text-3xl font-bold text-gray-900">Task Management System</h1>
                    </div>
                </header>
                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <TaskManager />;
                </main>
            </div>

        </>
    );
};

export default Dashboard;