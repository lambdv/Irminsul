"use client"
import React, { Suspense, useState } from 'react'
import Image from 'next/image'
import styles from './settings.module.css'
import Modal from '@/components/ui/Modal'
import { changeAccountPfp, changeUsername, clearAccountPfp } from './actions'
import RoundBtn from '@/components/ui/RoundBtn'
import Btn from '@/components/ui/Btn'
import { useSessionContext } from '@/lib/session-context'

export default function AccountSettings(props: {session: any, account: any, isSupporter: boolean}) {
  const { logout } = useSessionContext()

  const [usernameModal, setUsernameModal] = useState(false)
  const toggleUsernameModal = () => {
    setUsernameModal(!usernameModal)
  }

  const [pfpModal, setPfpModal] = useState(false)
  const togglePfpModal = () => {
    setPfpModal(!pfpModal)
  }

  const [deletePfpModal, setDeletePfpModal] = useState(false)
  const toggleDeletePfpModal = () => {
    setDeletePfpModal(!deletePfpModal)
  }

  return (
    <div className={styles.accountSettingsContainer}>
        <h1 className="mb-1">Account Settings</h1>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <b style={{fontSize: '0.9rem'}}>Email:</b>
            <p style={{fontSize: '0.9rem'}}>{props.session.user.email} 
            </p>
          </div>
        </div>        
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <b style={{fontSize: '0.9rem'}}>Provider:</b>
            <p style={{fontSize: '0.9rem'}}>{props.account[0].provider} 
            </p>
          </div>
        </div>



        <div className="flex items-center gap-2">
            <b style={{fontSize: '0.9rem'}}>Username:</b> 
            <p style={{fontSize: '0.9rem'}}>{props.session.user.name}</p>

            <Btn onClick={toggleUsernameModal}>
              <p style={{fontSize: '0.7rem'}}>Change</p>
              <span className="material-symbols-outlined" style={{fontSize: '0.8rem', marginLeft: '2px', marginTop: '2px', color: 'var(--dim-text-color)'}}>edit</span>
            </Btn>
        </div>



        <div>
          <div className="flex items-center gap-1 flex-wrap">
              <b style={{fontSize: '0.9rem'}}>Profile Picture: </b>
                <div className="rounded-full overflow-hidden">
                  <Image src={props.session.user.image} alt="Profile Picture" width={50} height={50} />
                </div>
                {/* <Btn>
                  <p style={{fontSize: '0.9rem'}}>Sync with Discord</p>
                  <span className="material-symbols-outlined" style={{fontSize: '1.2rem', marginLeft: '2px', marginTop: '2px', color: 'var(--text-color)'}}>sync</span>
                </Btn> */}
                <Btn onClick={togglePfpModal}>
                  <p style={{fontSize: '0.7rem'}}>Change</p>
                  <span className="material-symbols-outlined" style={{fontSize: '0.8rem', marginLeft: '2px', marginTop: '2px', color: 'var(--dim-text-color)'}}>edit</span>
                </Btn>
                <Btn onClick={toggleDeletePfpModal}>
                  <p style={{fontSize: '0.7rem'}}>Delete</p>
                  <span className="material-symbols-outlined" style={{fontSize: '0.8rem', marginLeft: '2px', marginTop: '2px', color: 'var(--dim-text-color)'}}>close</span>
                </Btn>
          </div>
        </div>

        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <b style={{fontSize: '0.9rem'}}>Tier:</b>
            <p style={{fontSize: '0.9rem'}}>{props.isSupporter ? 'Supporter' : 'Free'}</p>
            <Suspense fallback={<p>Loading...</p>}>
              {!props.isSupporter && (
                <Btn href="/support">
                  <p style={{fontSize: '0.7rem', color: 'var(--dim-text-color)'}}>Learn More</p>
                </Btn>
              )}
            </Suspense>
          </div>
        </div>


        <div className="flex items-center gap-2">
          <Btn onClick={logout}>
            <p style={{fontSize: '0.9rem'}}>Logout</p>
          </Btn>
        </div>

        {usernameModal && (
              <Modal toggle={toggleUsernameModal} title="Change Username">
                <form action={async (formData) => {
                  const newUsername = formData.get('newUsername')
                  await changeUsername(newUsername as string)
                  window.location.reload()
                }}>
                  <input 
                    name="newUsername"
                    type="text" 
                    placeholder="New Username" 
                    title="New Username" 
                    style={{
                      backgroundColor: 'var(--background-color)',
                      color: 'var(--text-color)', 
                      border: 'none',
                      padding: '10px',
                      borderRadius: '5px',
                      width: '100%'
                    }}
                  />
                  <Btn type="submit">
                    <p style={{fontSize: '0.9rem', color: 'var(--text-color)'}}>Save</p>
                  </Btn>
                </form>
              </Modal>
            )}

          {pfpModal && (
              <Modal toggle={togglePfpModal} title="Change Profile Picture">
                <form action={async (formData) => {
                  const pfp = formData.get('pfp')
                  await changeAccountPfp(pfp as string)
                  window.location.reload()
                }}>
                  <input 
                    name="pfp"
                    type="text" 
                    placeholder="New Username" 
                    title="New Username" 
                    style={{
                      backgroundColor: 'var(--background-color)',
                      color: 'var(--text-color)', 
                      border: 'none',
                      padding: '10px',
                      borderRadius: '5px',
                      width: '100%'
                    }}
                    defaultValue="https://cdn.discordapp.com/"
                    pattern="^https:\/\/cdn\.discordapp\.com\/.*"
                    onKeyDown={(e) => {
                      const input = e.target as HTMLInputElement;
                      const prefix = "https://cdn.discordapp.com/";
                      if (e.key === 'Backspace' && input.value.length <= prefix.length) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      const prefix = "https://cdn.discordapp.com/";
                      if (!e.target.value.startsWith(prefix)) {
                        e.target.value = prefix;
                      }
                    }}
                  />
                  <Btn type="submit">
                    <p style={{fontSize: '0.9rem', color: 'var(--text-color)'}}>Save</p>
                  </Btn>
                </form>
              </Modal>
            )}

            {deletePfpModal && (
                <Modal toggle={toggleDeletePfpModal} title="Delete Profile Picture">
                  <form action={async (formData) => {
                      await clearAccountPfp()
                      window.location.reload()
                  }}>
                    <p>Are you sure you want to delete your profile picture?</p>
                    <Btn type="submit" style={{backgroundColor: '#ac0e0e', color: 'var(--background-color)', border: 'none'}}>
                      <p style={{fontSize: '0.9rem', color: 'var(--text-color)'}}>Delete</p>
                    </Btn>
                  </form>
                </Modal>
              )}

              </div>
            )
}
