import { useState } from 'react';
import axios from 'axios';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/register', { email, password, name, otp });
      alert('Registered successfully');
    } catch (err) {
      alert('Registration failed');
    }
  };

  const sendOtp = async () => {
    await axios.post('/api/auth/send-otp', { email });
    alert('OTP sent to email');
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form onSubmit={handleRegister} className="space-y-4">
        <input type="text" className="w-full border p-2" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input type="email" className="w-full border p-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <button type="button" className="bg-gray-500 text-white px-4 py-2" onClick={sendOtp}>Send OTP</button>
        <input type="text" className="w-full border p-2" placeholder="OTP" value={otp} onChange={e => setOtp(e.target.value)} />
        <input type="password" className="w-full border p-2" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="bg-green-500 text-white px-4 py-2 rounded">Register</button>
      </form>
    </div>
  );
};

export default RegisterPage;