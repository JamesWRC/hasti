import PlusIcon from "@heroicons/react/20/solid/PlusIcon";
import { useState } from "react";
import DialogPanel from "./DialogPanel";
import { QuestionIcon } from "@primer/octicons-react";
import { IconQuestionMark } from "@tabler/icons-react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { IoTClassifications } from '../../../backend/codebase/app/interfaces/project/index';


export function RepoSelectHelp() {
    const [open, setOpen] = useState(false);

    function openDialog(e: React.MouseEvent) { e.preventDefault(); setOpen(true); }

    return (
        <>
            <DialogPanel
                setOpen={setOpen}
                open={open}
                stateType="info"
                title="Select or import a repository"
                // message="Select a repository that you want to use with HASTI. 
                // Or import a developers repository. This cannot be changed later."
                message={
                    <div className="text-left">
                        Choose a repository to base the project off. <br/>
                        Either:
                        <li>Select a repository that you are a contributor of.</li>
                        <li>Import another developers repository.</li>
                        <br />
                        <p className="font-bold">Note:</p>
                        <li>This cannot be changed later.</li>
                        <li>The readme / HASTI.md file will be displayed to people when they search for your project.</li>
                        <li>Importing a repository from another developer, means the developer can claim this project at any time.</li>
                    </div>}
                confirmBtnText="Ok"
                cancelBtnText=""
                onConfirm={() => setOpen(false)}
                customBtnText=""
                customAction={() => { }}
                onCancel={() => { }}
            />

            <div className="flex items-center pb-1">
                <span className="mr-2 block text-sm font-medium leading-6 text-gray-900">Repository</span>
                <button
                    type="button"
                    className="mt-0.5 rounded-full bg-gray-400 p-0.5 text-white shadow-sm font-bold hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-100"
                    onClick={(e) => openDialog(e)}
                >
                    <IconQuestionMark className="h-3 w-3" aria-hidden="true" />
                </button>
            </div>

        </>
    )
}


export function ImageUploadHelp() {
    const [open, setOpen] = useState(false);

    function openDialog(e: React.MouseEvent) { e.preventDefault(); setOpen(true); }

    return (
        <>
            <DialogPanel
                setOpen={setOpen}
                open={open}
                stateType="info"
                title="Upload images"
                // message="Select a repository that you want to use with HASTI. 
                // Or import a developers repository. This cannot be changed later."
                message={
                    <div className="text-left py-3">
                        Upload images to display with your project.

                        <br />
                        <p className="font-bold">Icon image:</p>
                        <li>Should make your project stand out. </li>
                        <li>Will function similar to a iOS/Andorid app icon.</li>
                        <br />
                        <p className="font-bold">Background image:</p>
                        <li>Will be used on the project page / project card.</li>
                        <li>Could be used to show off a bit more about the project.</li>

                        <hr className="mt-2" />

                        <p className="font-bold ">Note:</p>
                        <li>Images <u>must</u> be under 10MB in size.</li>
                    </div>}
                confirmBtnText="Ok"
                cancelBtnText=""
                onConfirm={() => setOpen(false)}
                customBtnText=""
                customAction={() => { }}
                onCancel={() => { }}
            />

            <div className="flex items-center pb-1">
                <span className="mr-2 block text-sm font-medium leading-6 text-gray-900">Images</span>
                <button
                    type="button"
                    className="mt-0.5 rounded-full bg-gray-400 p-0.5 text-white shadow-sm font-bold hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-100"
                    onClick={(e) => openDialog(e)}
                >
                    <IconQuestionMark className="h-3 w-3" aria-hidden="true" />
                </button>
            </div>

        </>
    )
}


export function ProjectNameHelp() {
    const [open, setOpen] = useState(false);

    function openDialog(e: React.MouseEvent) { e.preventDefault(); setOpen(true); }

    return (
        <>
            <DialogPanel
                setOpen={setOpen}
                open={open}
                stateType="info"
                title="Project name"
                // message="Select a repository that you want to use with HASTI. 
                // Or import a developers repository. This cannot be changed later."
                message={<div>
                    Create the name of your project.
                <hr className="mt-2" />

                <p className="font-bold text-left">Note:</p>
                <li className="text-left">This cannot be changed later.</li>
                </div>
                
                }
                confirmBtnText="Ok"
                cancelBtnText=""
                onConfirm={() => setOpen(false)}
                customBtnText=""
                customAction={() => { }}
                onCancel={() => { }}
            />

            <div className="flex items-center pb-1">
                <span className="mr-2 block text-sm font-medium leading-6 text-gray-900">Project Name</span>
                <button
                    type="button"
                    className="mt-0.5 rounded-full bg-gray-400 p-0.5 text-white shadow-sm font-bold hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-100"
                    onClick={(e) => openDialog(e)}
                >
                    <IconQuestionMark className="h-3 w-3" aria-hidden="true" />
                </button>
            </div>

        </>
    )
}

export function ProjectTypeHelp() {
    const [open, setOpen] = useState(false);

    function openDialog(e: React.MouseEvent) { e.preventDefault(); setOpen(true); }

    return (
        <>
            <DialogPanel
                setOpen={setOpen}
                open={open}
                stateType="info"
                title="Project name"
                // message="Select a repository that you want to use with HASTI. 
                // Or import a developers repository. This cannot be changed later."
                // message="Select the type of project you are creating. This will help people find your project by categorizing it."
                message={<div className="text-left py-3">
                    Select the type of project you are creating. This will help people find your project by categorizing it.

                    <hr className="mt-2" />

                    <p className="font-bold ">Note:</p>
                    <li>This cannot be changed later.</li>
                </div>
                }
                confirmBtnText="Ok"
                cancelBtnText=""
                onConfirm={() => setOpen(false)}
                customBtnText=""
                customAction={() => { }}
                onCancel={() => { }}
            />

            <div className="flex items-center pb-1">
                <span className="mr-2 block text-sm font-medium leading-6 text-gray-900">Project Type</span>
                <button
                    type="button"
                    className="mt-0.5 rounded-full bg-gray-400 p-0.5 text-white shadow-sm font-bold hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-100"
                    onClick={(e) => openDialog(e)}
                >
                    <IconQuestionMark className="h-3 w-3" aria-hidden="true" />
                </button>
            </div>

        </>
    )
}


export function DescriptionHelp() {
    const [open, setOpen] = useState(false);

    function openDialog(e: React.MouseEvent) { e.preventDefault(); setOpen(true); }

    return (
        <>
            <DialogPanel
                setOpen={setOpen}
                open={open}
                stateType="info"
                title="Project name"
                // message="Select a repository that you want to use with HASTI. 
                // Or import a developers repository. This cannot be changed later."
                // message="Select the type of project you are creating. This will help people find your project by categorizing it."
                message={<div className="text-left py-3">
                    A brief description of your project. This will help people understand what your project is about.
                    It will also be used to help people find your project when searching.

                    <hr className="mt-2" />

                    <p className="font-bold ">Note:</p>
                    <li>Suggested to be ~20-30 words.</li>
                    <li>Good Examples:</li>
                    <div className="flex items-center pl-4">
                        <XMarkIcon className="w-4 h-4 text-green-600" />
                        <span className="ml-2 ">&ldquo;Eufy security camera / doorbell integration with Home Kit...&ldquo;</span>
                    </div>
                    <div className="flex items-center pl-4">
                        <XMarkIcon className="w-4 h-4 text-green-600" />
                        <span className="ml-2 ">&ldquo;Control your Meross devices in a very flexible way...&ldquo;</span>
                    </div>
                    <br/>
                    <li>Not so good examples:</li>
                    <div className="flex items-center pl-4">
                        <XMarkIcon className="w-4 h-4 text-red-600" />
                        <span className="ml-2 ">&ldquo;A Home Asisstant Integration that integrates with Eufy security cameras and doorbells.&ldquo;</span>
                    </div>
                    <div className="flex items-center pl-4">
                        <XMarkIcon className="w-4 h-4 text-red-600" />
                        <span className="ml-2 ">&ldquo;Home Assistant integration for Meross devices.&ldquo;</span>
                    </div>
                    <hr className="mt-2" />
                    <span className="ml-2 ">These examples arnt the best since, people already know this is for Home Assistant and know they are an Integration/theme etc. Try to avoid redundant words to improve discoverability.</span>

                </div>
                }
                confirmBtnText="Ok"
                cancelBtnText=""
                onConfirm={() => setOpen(false)}
                customBtnText=""
                customAction={() => { }}
                onCancel={() => { }}
            />

            <div className="flex items-center pb-1">
                <span className="mr-2 block text-sm font-medium leading-6 text-gray-900">Description</span>
                <button
                    type="button"
                    className="mt-0.5 rounded-full bg-gray-400 p-0.5 text-white shadow-sm font-bold hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-100"
                    onClick={(e) => openDialog(e)}
                >
                    <IconQuestionMark className="h-3 w-3" aria-hidden="true" />
                </button>
            </div>

        </>
    )
}


export function InstallTypeHelp() {
    const [open, setOpen] = useState(false);

    function openDialog(e: React.MouseEvent) { e.preventDefault(); setOpen(true); }

    return (
        <>
            <DialogPanel
                setOpen={setOpen}
                open={open}
                stateType="info"
                title="Install type"
                // message="Select a repository that you want to use with HASTI. 
                // Or import a developers repository. This cannot be changed later."
                // message="Select the type of project you are creating. This will help people find your project by categorizing it."
                message={<div className="text-left py-3">
                   The Home Assistant installation type(s) the project is compatible with or designed for.<br/>
                   Select &apos;Any&apos; if the project is compatible with any/all installation types. <br/>
                    <hr className="mt-2" />

                    <p className="font-bold ">Note:</p>
                    <li>You can find all installation types and what is supported <a href="https://www.home-assistant.io/installation/#advanced-installation-methods" target="_blank" className="underline underline-offset-1">here </a>
                    </li>
                </div>
                }
                confirmBtnText="Ok"
                cancelBtnText=""
                onConfirm={() => setOpen(false)}
                customBtnText=""
                customAction={() => { }}
                onCancel={() => { }}
            />

            <div className="flex items-center pb-1">
                <span className="mr-2 block text-sm font-medium leading-6 text-gray-900">Install Type</span>
                <button
                    type="button"
                    className="mt-0.5 rounded-full bg-gray-400 p-0.5 text-white shadow-sm font-bold hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-100"
                    onClick={(e) => openDialog(e)}
                >
                    <IconQuestionMark className="h-3 w-3" aria-hidden="true" />
                </button>
            </div>

        </>
    )
}


export function TagsHelp() {
    const [open, setOpen] = useState(false);

    function openDialog(e: React.MouseEvent) { e.preventDefault(); setOpen(true); }

    return (
        <>
            <DialogPanel
                setOpen={setOpen}
                open={open}
                stateType="info"
                title="Tags"
                // message="Select a repository that you want to use with HASTI. 
                // Or import a developers repository. This cannot be changed later."
                // message="Select the type of project you are creating. This will help people find your project by categorizing it."
                message={<div className="text-left py-3">
                    Tags are used to categorize and help people find your project.
                </div>
                }
                confirmBtnText="Ok"
                cancelBtnText=""
                onConfirm={() => setOpen(false)}
                customBtnText=""
                customAction={() => { }}
                onCancel={() => { }}
            />

            <div className="flex items-center pb-1">
                <span className="mr-2 block text-sm font-medium leading-6 text-gray-900">Tags</span>
                <button
                    type="button"
                    className="mt-0.5 rounded-full bg-gray-400 p-0.5 text-white shadow-sm font-bold hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-100"
                    onClick={(e) => openDialog(e)}
                >
                    <IconQuestionMark className="h-3 w-3" aria-hidden="true" />
                </button>
            </div>

        </>
    )
}


export function ContentSwitchHelp() {
    const [open, setOpen] = useState(false);

    function openDialog(e: React.MouseEvent) { e.preventDefault(); setOpen(true); }

    return (
        <>
            <DialogPanel
                setOpen={setOpen}
                open={open}
                stateType="info"
                title="Markdown File to use"
                // message="Select a repository that you want to use with HASTI. 
                // Or import a developers repository. This cannot be changed later."
                // message="Select the type of project you are creating. This will help people find your project by categorizing it."
                message={<div className="text-left py-3">
                    Select which markdown file to use for the project content. README.md is fine for very simple projects, however if you want a stylish and more customizable project page, use HASTI.md.
                    <hr className="mt-2" />
                    <p className="font-bold ">README.md:</p>

                    <li>Will use the readme file from the repository.</li>
                    <li>The markdown would use the GitHub style Markdown.</li>
                    <li>Will be slightly formatted when displayed to people. So it may not look identical, you may want to export the formatted version and add a HAST.md file to your repository.</li>
                    <hr className="mt-2" />

                    <p className="font-bold ">HASTI.md:</p>
                    <li>Compatible with typical GitHub Readme.md markdown out of the box</li>
                    <li>Uses the <a href="https://markdoc.dev/docs/syntax" target="_blank" className="underline underline-offset-1">Markdoc</a> Markdown syntax </li>
                    <li>Has custom markdown formats to enhance and customize the projects content to your liking</li>
                    <li>Allows for HTML to be rendered</li>
                
                
                </div>
                }
                confirmBtnText="Ok"
                cancelBtnText=""
                onConfirm={() => setOpen(false)}
                customBtnText=""
                customAction={() => { }}
                onCancel={() => { }}
            />

            <div className="flex items-center pb-1">
                <span className="mr-2 block text-sm font-medium leading-6 text-gray-900">Markdown file to use</span>
                <button
                    type="button"
                    className="mt-0.5 rounded-full bg-gray-400 p-0.5 text-white shadow-sm font-bold hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-100"
                    onClick={(e) => openDialog(e)}
                >
                    <IconQuestionMark className="h-3 w-3" aria-hidden="true" />
                </button>
            </div>

        </>
    )
}


export function IoTClassificationHelp() {
    const [open, setOpen] = useState(false);

    function openDialog(e: React.MouseEvent) { e.preventDefault(); setOpen(true); }

    return (
        <>
            <DialogPanel
                setOpen={setOpen}
                open={open}
                stateType="info"
                title="IoT Classification"
                // message="Select a repository that you want to use with HASTI. 
                // Or import a developers repository. This cannot be changed later."
                // message="Select the type of project you are creating. This will help people find your project by categorizing it."
                message={<div className="text-left py-3">
                    This Classification is used to categorize the type of IoT project, and how it interacts with Home Assistant / 3rd party services.
                </div>
                }
                confirmBtnText="Ok"
                cancelBtnText=""
                onConfirm={() => setOpen(false)}
                customBtnText=""
                customAction={() => { }}
                onCancel={() => { }}
            />

            <div className="flex items-center pb-1">
                <span className="mr-2 block text-sm font-medium leading-6 text-gray-900">IoT Classification</span>
                <button
                    type="button"
                    className="mt-0.5 rounded-full bg-gray-400 p-0.5 text-white shadow-sm font-bold hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-100"
                    onClick={(e) => openDialog(e)}
                >
                    <IconQuestionMark className="h-3 w-3" aria-hidden="true" />
                </button>
            </div>

        </>
    )
}

export function HAVersionHelp() {
    const [open, setOpen] = useState(false);

    function openDialog(e: React.MouseEvent) { e.preventDefault(); setOpen(true); }

    return (
        <>
            <DialogPanel
                setOpen={setOpen}
                open={open}
                stateType="info"
                title="Home Assistant Version"
                // message="Select a repository that you want to use with HASTI. 
                // Or import a developers repository. This cannot be changed later."
                // message="Select the type of project you are creating. This will help people find your project by categorizing it."
                message={<div className="text-left py-3">
                    The version of Home Assistant that the project is compatible with. 
                    Use the version that the project was last tested with. <br/><br/>
                    <b>Use &apos;Any&apos; if:</b>
                    <li>It is compatible with all versions of Home Assistant.</li>
                    <li>This project does not rely on a version. </li>
                    <li>This project is a Theme, tutorial, basic script etc</li>
                </div>
                }
                confirmBtnText="Ok"
                cancelBtnText=""
                onConfirm={() => setOpen(false)}
                customBtnText=""
                customAction={() => { }}
                onCancel={() => { }}
            />

            <div className="flex items-center pb-1">
                <span className="mr-2 block text-sm font-medium leading-6 text-gray-900">Home Assistant Version</span>
                <button
                    type="button"
                    className="mt-0.5 rounded-full bg-gray-400 p-0.5 text-white shadow-sm font-bold hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-100"
                    onClick={(e) => openDialog(e)}
                >
                    <IconQuestionMark className="h-3 w-3" aria-hidden="true" />
                </button>
            </div>

        </>
    )
}