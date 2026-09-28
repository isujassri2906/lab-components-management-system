import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import ProfileSetup from './components/ProfileSetup';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (user && user.role === 'student') {
      setLoadingProfile(true);
      fetch(`http://127.0.0.1:5000/api/profile/${user.id}`)
        .then(res => res.json())
        .then(data => {
          setProfile(data);
          setLoadingProfile(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingProfile(false);
        });
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    setProfile(null);
  };

  const isProfileComplete = profile && profile.name && profile.register_number && profile.enrollment_number && profile.department && profile.year;

  if (loadingProfile) {
    return <div className="app-layout">Loading...</div>;
  }

  return (
    <div className="app-layout">
      {user ? (
        user.role === 'student' && !isProfileComplete ? (
           <ProfileSetup user={user} profile={profile} onSave={(updated) => setProfile(updated)} />
        ) : (
           <StudentDashboard user={user} profile={profile} onLogout={handleLogout} />
        )
      ) : (
        <Login onLogin={setUser} />
      )}
    </div>
  );
}

export default App;
