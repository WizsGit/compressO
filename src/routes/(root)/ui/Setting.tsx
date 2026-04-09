import React, { useState } from 'react'

function useDisclosure() {
  const [isOpen, setIsOpen] = useState(false)
  const onOpen = () => setIsOpen(true)
  const onClose = () => setIsOpen(false)
  return { isOpen, onOpen, onClose }
}

import Button from '@/components/Button'
import Divider from '@/components/Divider'
import Dropdown, {
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@/components/Dropdown'
import Icon from '@/components/Icon'
import Modal, { ModalContent } from '@/components/Modal'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import Title from '@/components/Title'
import { toast } from '@/components/Toast'
import Tooltip from '@/components/Tooltip'
import About from './About'

type DropdownKey = 'settings' | 'about'

function Setting() {
  const modalDisclosure = useDisclosure()

  const [selectedKey, setSelectedKey] = React.useState<DropdownKey>('settings')
  const handleDropdownAction = (item: string | number) => {
    modalDisclosure.onOpen()
    setSelectedKey(item as DropdownKey)
  }

  return (
    <>
      <div className="absolute bottom-4 left-4 p-0 z-[1]">
        <Dropdown placement="right">
          <DropdownTrigger>
            <Button isIconOnly size="sm">
              <Tooltip
                content="Open Settings"
                aria-label="Open Settings"
                placement="right"
              >
                <Icon name="setting" size={23} />
              </Tooltip>
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            variant="faded"
            aria-label="Dropdown menu with description"
            onAction={handleDropdownAction}
          >
            <DropdownItem key="settings" startContent={<Icon name="setting" />}>
              Settings
            </DropdownItem>
            <DropdownItem key="about" startContent={<Icon name="info" />}>
              About
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <Modal isOpen={modalDisclosure.isOpen} onClose={modalDisclosure.onClose}>
        <ModalContent className="max-w-[30rem] pb-2 overflow-hidden rounded-2xl">
          {selectedKey === 'settings' ? <AppSetting /> : <About />}
        </ModalContent>
      </Modal>
    </>
  )
}

function AppSetting() {
  const [confirmClearCache, setConfirmClearCache] = React.useState(false)
  const [isCacheDeleting, setIsCacheDeleting] = React.useState(false)

  const deleteCache = async () => {
    setIsCacheDeleting(true)
    try {
      localStorage.clear()
      toast.success('All caches were cleared.')
      setConfirmClearCache(false)
    } catch (_) {
      toast.error('Could not clear cache at the moment.')
    }
    setIsCacheDeleting(false)
  }

  return (
    <div className="w-full py-12 pb-16 px-8">
      <section className="mb-6">
        <Title title="Settings" iconProps={{ name: 'setting' }} />
      </section>
      <div className="mx-auto bg-zinc-100 dark:bg-zinc-800 rounded-lg px-4 py-3 overflow-hidden">
        <div className="flex justify-between items-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Theme</p>
          <ThemeSwitcher />
        </div>
        <Divider className="my-2 dark:bg-zinc-700" />
        <div className="flex justify-between items-center">
          <p className="dark:text-red-400 text-sm text-red-400">Clear Cache</p>
          <Tooltip
            content="Clear cache"
            aria-label="Clear cache"
            placement="right"
            isDisabled={confirmClearCache}
          >
            <div className="flex items-center">
              <Button
                isIconOnly={!confirmClearCache}
                size="sm"
                color="danger"
                variant={confirmClearCache ? 'solid' : 'flat'}
                onPress={() => {
                  if (!confirmClearCache) {
                    setConfirmClearCache(true)
                  } else {
                    deleteCache()
                  }
                }}
                isLoading={isCacheDeleting}
              >
                <div>
                  <Icon name="trash" />
                </div>

                {confirmClearCache ? (
                  <p className="ml-2 font-medium">Clear Now</p>
                ) : null}
              </Button>
            </div>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}

export default Setting
