import { Dispatch, Fragment, SetStateAction, useEffect, useRef, useState, ReactElement } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ArrowPathIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { QuestionIcon, XIcon } from '@primer/octicons-react'
import { TextInput } from '@mantine/core';
import React from 'react';

export default function DialogPanel({setOpen, open, stateType, title, message, confirmBtnText, cancelBtnText, onConfirm, onCancel, customBtnText, customAction, confirmActionText }
    : {setOpen:Dispatch<SetStateAction<boolean>>, open: boolean, stateType: string, title: string, message: string|ReactElement, confirmBtnText: string, cancelBtnText: string, onConfirm: any, onCancel: any, customBtnText: string, customAction: any, confirmActionText?:string }) {

    const cancelButtonRef = useRef(null)
    const [confirmDisabled, setConfirmDisabled] = useState(false)

    
    useEffect(() => {
        if(stateType === 'confirm' ) {
            setConfirmDisabled(true)
        }
    }, [stateType])


    function classNames(...classes: string[]) {
        return classes.filter(Boolean).join(' ')
    }

    function handleConfirm() {
        setOpen(false)
        onConfirm()
    }

    function handleCancel() {
        setOpen(false)
        onCancel()
    }

    function handleCustomAction() {
        setOpen(false)
        customAction()
    }

    function handleConfirmTextMatch(e: any) {
        console.log(e.target.value)
        if(e.target.value === confirmActionText) {
            setConfirmDisabled(false)
        } else {
            setConfirmDisabled(true)
        }
    }


    let statusIcon = null
    if(stateType === 'success') {
        statusIcon = <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                    </div>
    } else if(stateType === 'pending') {
        statusIcon = <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                        <ArrowPathIcon className="h-6 w-6 text-gray-600 animate-spin animate-duration-1000" aria-hidden="true" />
                    </div>
    }else if(stateType === 'warn') {
        statusIcon = <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                        <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" aria-hidden="true" />
                    </div>
    } else if(stateType === 'error') {
        statusIcon = <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <XIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
    } else {
        statusIcon = <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                        <QuestionIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                    </div>
    }

    let messageContent = null
    console.log("typeof message")
    console.log(typeof message)
    if(typeof message === 'string') {
        messageContent = <p className="">{message}</p>
    } else if(typeof message === 'object') {
        messageContent = message
    }

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog className="relative z-[1000]" initialFocus={cancelButtonRef} onClose={setOpen}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                                <div>
                                    {statusIcon}
                                    <div className="mt-3 text-center sm:mt-5">
                                        <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                                            {title}
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                <React.Fragment>{messageContent}</React.Fragment>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {stateType === 'confirm' && confirmActionText ?
                                    <TextInput
                                    description={`You must type '${confirmActionText}' exactly to confirm`}
                                    placeholder="Type here to confirm"
                                    onChange={(e) => handleConfirmTextMatch(e)}
                                  /> : null}
                                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                                    <button
                                        type="button"
                                        className={classNames("inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2  sm:col-start-2", 
                                        (confirmDisabled && confirmActionText ? true : false) ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600")}
                                        onClick={() =>  handleConfirm()}
                                        disabled={confirmDisabled && confirmActionText ? true : false}

                                    >
                                        {confirmBtnText}
                                    </button>
                                    {cancelBtnText.length <= 0 ? null :
                                        <button
                                            type="button"
                                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                                            onClick={() => handleCancel()}
                                            ref={cancelButtonRef}
                                        >
                                            {cancelBtnText}
                                        </button>
                                    }
                                </div>
                                {!customBtnText || customBtnText.length <= 0 ? null :
                                <button
                                    type="button"
                                    className="mt-4 inline-flex w-full justify-center rounded-md bg-dark px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                                    onClick={() => handleCustomAction()}
                                > 
                                    {customBtnText}
                                </button>
                                }
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}
