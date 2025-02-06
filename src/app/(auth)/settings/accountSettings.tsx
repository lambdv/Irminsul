"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import styles from './settings.module.css'
import Modal from '@/components/ui/Modal'
import { changeUsername } from './actions'

export default function AccountSettings(props: {session: any, account: any}) {

  const [usernameModal, setUsernameModal] = useState(false)
  const toggleUsernameModal = () => {
    setUsernameModal(!usernameModal)
  }


  return (
    <div className={styles.acountSettingsContainer}>
        <h1 className="mb-4">Account Settings</h1>

        <div className="flex items-center gap-2">
          <p>Username: {props.session.user.name}</p>
          <button className="p-1 bg-[#474747] rounded-md" onClick={toggleUsernameModal}>change username</button>
          {
            usernameModal && (
              <Modal toggle={toggleUsernameModal} title="Change Username">
                <form action={async (formData) => {
                  const newUsername = formData.get('newUsername')
                  await changeUsername(newUsername as string)
                }}>
                  <input type="text" placeholder="New Username" />
                  

                  <button className="p-1 bg-[#474747] rounded-md" type="submit">change username</button>
                </form>
              </Modal>

            )
          }
        </div>

        <p>Linked with: {props.account[0].provider}</p>




        <div>
        <p>Email: {props.session.user.email}</p>
        </div>
        <div className="flex items-center gap-2">

            <p>Profile Picture: </p>
            <div className="block">
                <Image src={props.session.user.image} alt="Profile Picture" width={100} height={100} />
                <button>Change</button>
                <button>Delete</button>
            </div>
        </div>

        <div className="flex items-center gap-2">
          <h1>Danger Zone</h1>
          {/* <button className="bg-[#eb4545] rounded-md p-1">Purge Comments</button> */}
          <button className="bg-[#eb4545] rounded-md p-1">Delete Account</button>

        </div>
    </div>
  )
}
