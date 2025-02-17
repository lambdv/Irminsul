"use client"
import React, { useState } from 'react'
import { deleteAccount, purgeComments } from './actions'
import Modal from '@/components/ui/Modal'
import { Button } from '@mui/material'
export default function DangerZoneSettings() {
    const [deleteAccountModal, setDeleteAccountModal] = useState(false)
    const toggleDeleteAccountModal = () => {
        setDeleteAccountModal(!deleteAccountModal)
    }

    const [purgeCommentsModal, setPurgeCommentsModal] = useState(false)
    const togglePurgeCommentsModal = () => {
        setPurgeCommentsModal(!purgeCommentsModal)
    }
  return (
    <div>
        <div className="flex items-center gap-2">
        

          <Button
            variant="contained"
            onClick={togglePurgeCommentsModal}
            sx={{
              backgroundColor: '#eb4545',
              '&:hover': {
                backgroundColor: '#d13030',
              }
            }}
          >
            Purge All Comments
          </Button>
          <Button
            variant="contained" 
            onClick={toggleDeleteAccountModal}
            sx={{
              backgroundColor: '#eb4545',
              '&:hover': {
                backgroundColor: '#d13030',
              }
            }}
          >
            Delete Account
          </Button>

          {
            deleteAccountModal && (
                <Modal toggle={toggleDeleteAccountModal} title="Delete Account">
                    <DeleteAccountForm toggle={toggleDeleteAccountModal} />
                </Modal>
            )
          }

          {
            purgeCommentsModal && (
                <Modal toggle={togglePurgeCommentsModal} title="Purge All Comments">
                    <PurgeCommentsForm toggle={togglePurgeCommentsModal} />
                </Modal>
            )
          }


        </div>
    </div>


  )
}

function PurgeCommentsForm(props: {toggle}) {
    const [confirmText, setConfirmText] = useState("")
    return (
        <form action={async (e) => {
            await purgeComments()
            window.location.reload()
        }} className='flex flex-col gap-2'>
            <input 
                type="text" 
                placeholder="Type 'delete' to confirm" 
                className='bg-[#474747] rounded-md p-1'
                onChange={(e) => setConfirmText(e.target.value)}
                style={{
                    backgroundColor: "#252525",
                    color: "#e6e6e6", 
                    border: "none",
                    outline: "none",
                    borderRadius: "2px",
                    padding: "10px 10px",
                }}
            />
            <div className='flex flex-row gap-2 justify-end'>
                <button className="waves-effect waves-light ripple" style={{backgroundColor: "#474747", color: "#e6e6e6", border: "none", outline: "none", borderRadius: "2px", padding: "5px 10px"}} onClick={props.toggle}>Cancel</button>
                <button 
                    className="waves-effect waves-light ripple"
                    type='submit'
                    disabled={confirmText !== "delete"}
                    style={{
                        backgroundColor: confirmText !== "delete" ? "#474747" : "#eb4545",
                        cursor: confirmText !== "delete" ? "not-allowed" : "pointer",
                        color: confirmText !== "delete" ? "#808080" : "#e6e6e6",
                        width: "fit-content",
                        padding: "5px 10px",
                        borderRadius: "2px",
                    }}>
                    Purge Comments
                </button>
            </div>
        </form>
    )
}

function DeleteAccountForm(props: {toggle}) {
    const [confirmText, setConfirmText] = useState("")
    return (
        <form action={async (e) => {
            await deleteAccount()
            window.location.reload() //allow reload
        }} className='flex flex-col gap-2'>
            <input 
                type="text" 
                placeholder="Type 'delete' to confirm" 
                className='bg-[#474747] rounded-md p-1' 
                onChange={(e) => setConfirmText(e.target.value)}
                style={{
                    backgroundColor: "#252525",
                    color: "#e6e6e6",
                    border: "none",
                    outline: "none",
                    borderRadius: "2px",
                    padding: "10px 10px",
                }}
            />
            <div className='flex flex-row gap-2 justify-end'>
            <button className="waves-effect waves-light ripple" style={{backgroundColor: "#474747", color: "#e6e6e6", border: "none", outline: "none", borderRadius: "2px", padding: "5px 10px"}} onClick={props.toggle}>Cancel</button>
            <button 
                className=" waves-effect waves-light ripple "
                type='submit' 
                disabled={confirmText !== "delete"} 
                style={{
                    backgroundColor: confirmText !== "delete" ? "#474747" : "#eb4545",
                    cursor: confirmText !== "delete" ? "not-allowed" : "pointer",
                    color: confirmText !== "delete" ? "#808080" : "#e6e6e6",
                    width: "fit-content",
                    padding: "5px 10px",
                    borderRadius: "2px",
                }}>
                    Delete Account

                </button>
                
            </div>
        </form>

    )


}
