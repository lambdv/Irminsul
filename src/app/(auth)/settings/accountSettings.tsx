"use client"
import React, { Suspense, useState } from "react"
import Image from "next/image"
import Modal from "@/components/ui/Modal"
import { changeAccountPfp, changeUsername, clearAccountPfp } from "./actions"
import { Button } from "@/components/cn/button"
import { Input } from "@/components/cn/input"
import { Label } from "@/components/cn/label"
import { useSessionContext } from "@/lib/session-context"
import { Edit, Trash2, LogOut, ExternalLink } from "lucide-react"

export default function AccountSettings(props: {
  session: any
  account: any
  isSupporter: boolean
}) {
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Email</Label>
          <p className="text-sm text-muted-foreground">
            {props.session.user.email}
          </p>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Provider</Label>
          <p className="text-sm text-muted-foreground">
            {props.account[0].provider}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label className="text-sm font-medium">Username</Label>
          <p className="text-sm text-muted-foreground">
            {props.session.user.name}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={toggleUsernameModal}>
          <Edit className="h-4 w-4 mr-2" />
          Change
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Profile Picture</Label>
          <div className="flex items-center gap-3">
            <div className="rounded-full overflow-hidden">
              <Image
                src={props.session.user.image}
                alt="Profile Picture"
                width={50}
                height={50}
                className="h-12 w-12 object-cover"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={togglePfpModal}>
            <Edit className="h-4 w-4 mr-2" />
            Change
          </Button>
          <Button variant="outline" size="sm" onClick={toggleDeletePfpModal}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label className="text-sm font-medium">Tier</Label>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              {props.isSupporter ? "Supporter" : "Free"}
            </p>
            <Suspense fallback={<p>Loading...</p>}>
              {!props.isSupporter && (
                <Button variant="ghost" size="sm" asChild>
                  <a href="/pricing" className="flex items-center">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Learn More
                  </a>
                </Button>
              )}
            </Suspense>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button variant="destructive" onClick={logout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      {usernameModal && (
        <Modal toggle={toggleUsernameModal} title="Change Username">
          <form
            action={async (formData) => {
              const newUsername = formData.get("newUsername")
              await changeUsername(newUsername as string)
              window.location.reload()
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="newUsername">New Username</Label>
              <Input
                id="newUsername"
                name="newUsername"
                type="text"
                placeholder="Enter new username"
              />
            </div>
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </form>
        </Modal>
      )}

      {pfpModal && (
        <Modal toggle={togglePfpModal} title="Change Profile Picture">
          <form
            action={async (formData) => {
              const pfp = formData.get("pfp")
              await changeAccountPfp(pfp as string)
              window.location.reload()
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="pfp">Discord Profile Picture URL</Label>
              <Input
                id="pfp"
                name="pfp"
                type="url"
                placeholder="https://cdn.discordapp.com/..."
                defaultValue="https://cdn.discordapp.com/"
                pattern="^https:\/\/cdn\.discordapp\.com\/.*"
                onKeyDown={(e) => {
                  const input = e.target as HTMLInputElement
                  const prefix = "https://cdn.discordapp.com/"
                  if (
                    e.key === "Backspace" &&
                    input.value.length <= prefix.length
                  ) {
                    e.preventDefault()
                  }
                }}
                onChange={(e) => {
                  const prefix = "https://cdn.discordapp.com/"
                  if (!e.target.value.startsWith(prefix)) {
                    e.target.value = prefix
                  }
                }}
              />
            </div>
            <Button type="submit" className="w-full">
              Update Profile Picture
            </Button>
          </form>
        </Modal>
      )}

      {deletePfpModal && (
        <Modal toggle={toggleDeletePfpModal} title="Delete Profile Picture">
          <form
            action={async (formData) => {
              await clearAccountPfp()
              window.location.reload()
            }}
            className="space-y-4"
          >
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete your profile picture? This action
              cannot be undone.
            </p>
            <Button type="submit" variant="destructive" className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Profile Picture
            </Button>
          </form>
        </Modal>
      )}
    </div>
  )
}
