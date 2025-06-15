import { useEffect, useState } from 'react';
import axios from 'axios';

const TaskListPage = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    axios.get('/api/tasks').then(res => setTasks(res.data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Tasks</h1>
      <ul className="mt-4 space-y-2">
        {tasks.map(task => (
          <li key={task._id} className="border p-4 rounded">
            <h2 className="font-semibold">{task.title}</h2>
            <p>{task.description}</p>
            <p className="text-sm text-gray-500">Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskListPage;