'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppBar, Box, Toolbar, Typography, Stack, Button, Avatar } from '@mui/material';
import SignInButton from './components/SignInButton';
import { auth, provider } from './firebase';

import { signInWithPopup } from 'firebase/auth';

export default function HomePage() {
  const [user, setUser] = useState(null);
  
  const router = useRouter();

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      style={{
        background: 'linear-gradient(135deg, #1E90FF 0%, #ff4d4d 100%)', // Cool gradient background
        overflow: 'hidden',
        position: 'relative',
      }}
      color="text.primary"
    >
    
    <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(90deg, rgba(29, 147, 242, 1) 0%, rgba(42, 245, 152, 1) 50%, rgba(144, 71, 255, 1) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}
        >
           Find the Best Professors for Your Classes
        </Typography>
      
   

      {/* Additional Info Button */}
      <Button
        variant="contained"
        size="large"
        style={{
          marginTop: '60px', // Adjust margin top
          zIndex: 2,
          background: '#ff4d4d',
          color: '#fff',
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: '600',
          padding: '12px 36px',
          borderRadius: '25px',
          boxShadow: '0px 8px 15px rgba(0, 0, 0, 0.3)',
          animation: 'fadeInUp 1.5s ease-in-out',
        }}
        onClick={async () => {
          await signInWithPopup(auth, provider);
          router.push('/dashboard');
        }}
        className="explore-button"
      >
        Start Exploring
      </Button>

      {/* Background Effects */}
      <Box
        style={{
          position: 'absolute',
          bottom: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 80%)',
          transform: 'rotate(45deg)',
          zIndex: 1,
          animation: 'spin 20s linear infinite',
        }}
      />

      {/* Responsive adjustments */}
      <style jsx>{`
        @media (max-width: 600px) {
          .welcome-text {
            font-size: 1.2rem; /* Further reduce the text size for mobile screens */
            top: 30%;
            padding: 0 10px; /* Add some padding to ensure text is not cut off */
          }
          .explore-button {
            margin-top: 20px; /* Adjust margin top for mobile */
            padding: 8px 24px;
            font-size: 0.9rem;
          }
          .MuiToolbar-root {
            padding-left: 8px;
            padding-right: 8px;
          }
          .avatar-stack {
            display: none; /* Hide avatar on mobile screens */
          }
          .logo-text {
            font-size: 0.9rem; /* Adjust the logo text size */
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </Box>
  );
}
