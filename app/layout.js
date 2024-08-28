'use client'
import { Inter } from "next/font/google";
import "./globals.css";
import { auth, provider } from './firebase';
import { useRouter } from 'next/navigation';
import { signInWithPopup, signOut } from 'firebase/auth';
import {
  Box,
  AppBar,
  Button,
  Typography,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SignInButton from './components/SignInButton';
import { useEffect, useState } from "react";
import Loader from './components/Loading';


const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const [userloading, setUserloading] = useState(false);
  const router = useRouter();

  const [user, setUser] = useState(null);

  const handleSignIn = async () => {
    setUserloading(true);
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard'); // Redirect to a dashboard or another page after signing in
    } catch (error) {
      console.error('Error signing in:', error);
      alert('Failed to sign in. Please try again.'); // Show a user-friendly error message
    }
    setUserloading(false);
  };

  const handleSignOut = async () => {
    setUserloading(true);
    try {
      await signOut(auth);
      setUser(null);
      router.push('/'); // Redirect to the homepage or a sign-in page after signing out
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.'); // Show a user-friendly error message
    }
    setUserloading(false);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        console.log(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        {userloading ? (
          <Box
            width="100vw"
            height="100vh"
            display="flex"
            justifyContent="center"
            alignItems="center"
            style={{
              background: 'rgba(0.5)', // Semi-transparent black background
              overflow: 'hidden',
              position: 'relative',
              zIndex: 9999, // Ensure it overlays other content
            }}
          >
            <Loader />
          </Box>
        ) : (
          <>
            <AppBar
              sx={{
                background:
                  "linear-gradient(112.1deg, rgb(32, 38, 57) 11.4%, rgb(63, 76, 119) 70.2%);",
              }}
              position="fixed"
            >
              <Toolbar>
                <Typography
                  variant="h6"
                  style={{ flexGrow: 1 }}
                  sx={{
                    background: "white",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontWeight: 400,
                    letterSpacing: "0.05em",
                    textShadow:
                      "3px 3px 6px rgba(0, 0, 0, 0.4), 1px 1px 2px rgba(255, 255, 255, 0.2)",
                    fontSize: "1rem",
                    transform: "translateZ(0)",
                    margin: "10px 0",
                    textTransform: "uppercase",
                  }}
                >
                  RateMyProfessor
                </Typography>
                {user ? (
                  <Button
                    variant="contained"
                    sx={{
                      maxWidth: '10vw',
                      minWidth: '100px',
                      background: '#ff4d4d',
                    }}
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    sx={{
                      maxWidth: '10vw',
                      minWidth: '100px',
                      background: '#ff4d4d',
                    }}
                    onClick={handleSignIn}
                  >
                    Sign In
                  </Button>
                )}
              </Toolbar>
            </AppBar>
            {children}
          </>
        )}
      </body>
    </html>
  );
}
