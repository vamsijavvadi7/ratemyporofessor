// pages/page.js
'use client'

import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { auth, db } from '../firebase';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { marked } from 'marked';
import { useRouter } from 'next/navigation';
import Loader from '../components/Loading';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('dark'); // Theme state
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        fetchMessages(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchMessages = async (userId) => {
    setLoading(true);
    const messagesDoc = await getDoc(doc(db, 'users', userId, 'messages', 'chat'));
    if (messagesDoc.exists()) {
      setMessages(messagesDoc.data().messages || []);
    } else {
      const initialMessages = [
        {
          role: 'assistant',
          content: "Hi! I'm the CareerGuru AI Coach. How can I help you today?",
        },
      ];
      setMessages(initialMessages);
      await setDoc(doc(db, 'users', userId, 'messages', 'chat'), { messages: initialMessages });
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    setLoading(true);
    if (!message.trim() || isLoading) return;
    setIsLoading(true);
    setMessage('');

    const newMessage = { role: 'user', content: message };
    const placeholderResponse = { role: 'assistant', content: '' };

    setMessages((prevMessages) => [
      ...prevMessages,
      newMessage,
      placeholderResponse,
    ]);

    try {
      const response = await fetch('../api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, newMessage]),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantMessage += decoder.decode(value, { stream: true });

        setMessages((prevMessages) => {
          let lastMessageIndex = prevMessages.length - 1;
          let updatedMessages = [...prevMessages];
          updatedMessages[lastMessageIndex] = {
            ...updatedMessages[lastMessageIndex],
            content: assistantMessage,
          };
          return updatedMessages;
        });
      }

      await updateDoc(doc(db, 'users', user.uid, 'messages', 'chat'), {
        messages: [...messages, newMessage, { role: 'assistant', content: assistantMessage }],
      });
    } catch (error) {
      console.error('Error:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ]);
    }
    setLoading(false);
    setIsLoading(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      router.push('/'); // Redirect to the homepage or a sign-in page after signing out
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.'); // Show a user-friendly error message
    }
    setLoading(false);
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const isDark = theme === 'dark';

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        background: 'rgb(2,0,36)',
        background: 'linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(9,9,121,1) 35%, rgba(0,212,255,1) 100%)',
        color: isDark ? 'white' : 'black',
        mt:'64px'
      }}
    >
      {loading && (
        <Box
          width="100vw"
          height="100vh"
          display="flex"
          justifyContent="center"
          alignItems="center"
          position="absolute"
          top={0}
          left={0}
          bgcolor="rgba(0, 0, 0, 0.5)" // Adds a semi-transparent background
          zIndex={9999} // Ensures the loader is on top of all other elements
        >
          <Loader />
        </Box>
      )}
      <Stack
        direction={'column'}
        width="100vw"
        height="100vh"
        border="1px solid black"
        p={2}
        spacing={3}
      >
            <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
          sx={{
            overflowY: 'auto',
            overflowX: 'hidden',
            '&::-webkit-scrollbar': {
              display: 'none', // Hides scrollbar in WebKit-based browsers
            },
            scrollbarWidth: 'none', // Hides scrollbar in Firefox
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
            >
             <Card
  sx={{
    maxWidth: '70%',
    bgcolor: isDark
      ? message.role === 'assistant'
        ? 'rgba(255, 255, 255, 0.1)' // Slightly transparent white for dark theme
        : 'rgba(0, 0, 0, 0.7)' // Slightly transparent gray for user messages
      : message.role === 'assistant'
      ? 'rgba(0, 0, 0, 0.1)' // Slightly transparent black for light theme
      : 'rgba(200, 200, 200, 0.7)', // Slightly transparent gray for user messages
    borderRadius: 2,
    boxShadow: 3,
    padding: '10px', // Add padding to avoid text getting cut off
    margin: '5px', // Add margin to ensure proper spacing
    overflowWrap: 'break-word', // Ensure long words break and don't overflow
    wordBreak: 'break-word', // Ensure long words break and don't overflow
  }}
>
  <CardContent>
    <Typography
      variant="body1"
      component="div"
      sx={{
        color: isDark
          ? message.role === 'assistant'
            ? 'white' // White text for dark theme assistant messages
            : 'white' // Black text for dark theme user messages
          : message.role === 'assistant'
          ? 'black' // Black text for light theme assistant messages
          : 'black', // Black text for light theme user messages
        overflowWrap: 'break-word', // Ensure long words break and don't overflow
        wordBreak: 'break-word', // Ensure long words break and don't overflow
      }}
      dangerouslySetInnerHTML={{ __html: marked.parse(message.content) }}
    />
  </CardContent>
</Card>

            </Box>
          ))}
        </Stack>

        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          sx={{ display: 'flex', alignItems: 'center', width: '100%' }}
        >
          <TextField
            fullWidth
            multiline
            maxRows={4}
            variant="outlined"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{
              bgcolor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
              color: isDark ? 'white' : 'black',
              borderRadius: '5px',
              border: '1px solid',
              borderColor: isDark ? 'primary.main' : 'secondary.main',
            }}
            InputProps={{
              style: {
                color: isDark ? 'white' : 'black',
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={sendMessage}
            disabled={isLoading}
            sx={{
              minWidth: '50px',
              minHeight: '50px',
              background: isDark
                ? 'linear-gradient(132deg, rgb(34, 181, 254) 0.00%, rgb(156, 43, 171) 100.00%)'
                : 'linear-gradient(132deg, lightgray 0.00%, white 100.00%)',
              color: isDark ? 'white' : 'black',
              borderRadius: '50%',
              marginLeft: '10px',
              '&:hover': {
                background: isDark
                  ? 'linear-gradient(132deg, rgb(34, 181, 254) 0.00%, rgb(39, 43, 44) 100.00%)'
                  : 'linear-gradient(132deg, lightgray 0.00%, white 100.00%)',
              },
            }}
          >
            Send
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}