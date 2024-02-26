import { Dialog, DialogTitle } from '@mui/material';
import React from 'react';
import Button from '@mui/material/Button';

interface ErrorDialogProps {
    dialogTitle: string
    errorMessage: string
    buttonClickCallback: () => void
    show: boolean
    buttonText: string
}

const ErrorDialog = (props: ErrorDialogProps) => {
    return (
        <div className='flow-up-animation'>
            <Dialog open={props.show} onClose={props.buttonClickCallback}>
                <div className='flex flex-col items-center'>
                    <DialogTitle className='font-jakarta-sans'>{props.dialogTitle}</DialogTitle>
                    <h1 className='m-5 font-jakarta-sans'>{props.errorMessage}</h1>
                    <Button variant='contained' className='font-jakarta-sans m-5 bg-primary' onClick={props.buttonClickCallback}>{props.buttonText}</Button>
                </div>
            </Dialog>
        </div>
    )
}

export default ErrorDialog;
