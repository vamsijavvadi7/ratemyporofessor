
import { CircularProgress, Typography } from '@mui/material';
import React from 'react'


const Loader = () => (
    <div className="fixed top-0 left-0 w-screen h-screen z-[99999999999999] flex items-center justify-center bg-black/40">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-orange">
        
        <Typography sx={{color:'white'}}>

        Loading.....
        </Typography>

            <CircularProgress>
           
            </CircularProgress>
            
           
        </div>
    </div>
);
export default Loader;