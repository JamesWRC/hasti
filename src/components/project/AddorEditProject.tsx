'use client'
import {
  ArrowLeftOnRectangleIcon,
  ArrowPathIcon,
  FolderPlusIcon,
  PhotoIcon,
  TrashIcon,
  UserPlusIcon,

} from '@heroicons/react/24/outline'

import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Title, Group, Box, LoadingOverlay, Switch } from '@mantine/core';
import SelectRepo from '@/frontend/components/repo/SelectRepo';
import { useEffect, useState } from 'react'

import { Repo } from '@/backend/interfaces/repo'



import { useForm } from '@mantine/form';
import { TextInput, Textarea, } from '@mantine/core';
import { useSession } from 'next-auth/react'
import { TagSearchResponse } from '@/backend/interfaces/tag/request'
import SearchTagComboBox from '@/frontend/components/ui/SearchComboBox'
import { SearchParams } from '@/backend/interfaces/tag';
import { ProjectType, HAInstallType, getAllHaInstallTypes, ProjectAllInfo, Project, getProjectType } from '@/backend/interfaces/project'
import { ProjectTypeSelectDropdownBox } from '@/frontend/components/ui/ProjectTypeSelectDropdownBox'

import { FileInput } from '@mantine/core';
import { HAInstallTypeSelectDropdownBox } from '@/frontend/components/ui/HAInstallTypeSelectDropdownBox'
import { AddProjectResponse, GetContentResponse, GetProjectsQueryParams, MAX_FILE_SIZE, RefreshContentResponse } from '@/backend/interfaces/project/request'


import ProjectGrid from '@/frontend/components/project/ProjectGrid';
import { v4 as uuidv4 } from 'uuid';
import { ProjectAddMethod, getProjectAddMethod, getAllProjectAddMethods } from '@/backend/interfaces/project/request';
import { LoadProjects } from '@/frontend/interfaces/project';
import isValidProjectName from '@/frontend/helpers/user';
import { IconDownload, IconSettings } from '@tabler/icons-react';
import Details from '@/frontend/components/store/content/Details';
import useProjects from '@/frontend/components/project';
import { User } from '@/backend/interfaces/user';
import { getHaInstallType } from '@/backend/interfaces/project/index';
import DialogPanel from '@/frontend/components/ui/DialogPanel';
import axios from 'axios';
import { RefreshRepoDataRequest } from '@/backend/interfaces/repo/request';
import { CheckAuthResponse, AuthCheckType } from '@/backend/interfaces/auth';
import { ContentSwitchHelp, DescriptionHelp, ImageUploadHelp, ProjectNameHelp, ProjectTypeHelp, TagsHelp } from '../ui/HelpDialogs';
import { downloadHASTIData } from '@/frontend/helpers/project';


const GIT_APP_NAME = process.env.NODE_ENV === 'production' ? 'hasti-bot' : 'hasti-bot-dev';



export default function AddorEditProject({ opened, open, close, projectID }: { opened: boolean, open: any, close: any, projectID?: string }) {
  const [selectRepo, setSelectedRepo] = useState<Repo | null>(null)
  const [projectType, setProjectType] = useState<ProjectType>();
  const [haInstallTypes, setHaInstallTypes] = useState<HAInstallType[]>([HAInstallType.ANY]);
  const [tags, setTags] = useState(['']);

  const [existingTags, setExistingTags] = useState(['']);
  const [iconImage, setIconImage] = useState<File | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [projectResponse, setProjectResponse] = useState<AddProjectResponse>({ success: true, message: '' });
  const [projectLoadedState, setProjectLoadedState] = useState<LoadProjects>()

  const { data: session, status } = useSession()


  let fetchProjects: GetProjectsQueryParams = {};

  const { projects, reqStatus, setSearchProps } = useProjects(fetchProjects);

  const [iconPreview, setIconPreview] = useState<string | ArrayBuffer | null>('');
  const [bgImagePreview, setBgImagePreview] = useState<string | ArrayBuffer | null>('');

  const [createProjectDialogOpen, setCreateProjectDialogOpen] = useState(false)
  const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false)
  const [claimProjectDialogOpen, setClaimProjectDialogOpen] = useState(false)
  // Used to check if the user has setup the HASTI GitHub app to access their repositories, and the token is valid after being decrypted.
  const [ghuTokenOkDialogOpen, setGhuTokenOkDialogOpen] = useState(false)
  const [ghuTokenOkResponse, setGhuTokenOkResponse] = useState<CheckAuthResponse>({ success: false, message: '', check: AuthCheckType.USER_OK });

  const [refreshRepoDialogOpen, setRefreshRepoDialogOpen] = useState(false)
  const [refreshRepoResponse, setRefreshRepoResponse] = useState<RefreshRepoDataRequest|null>(null);

  const [refreshContentDialogOpen, setRefreshContentDialogOpen] = useState(false)
  const [refreshContentResponse, setRefreshContentResponse] = useState<RefreshContentResponse|null>(null);

  const [exportHastiMDDialogOpen, setExportHastiMDDialogOpen] = useState(false)
  const [exportHastiMDResponse, setExportHastiMDResponse] = useState<GetContentResponse|null>(null);


  // To handle which README to use, the user's or the repo's
  const [hastiMdAvailable, setHastiMdAvailable] = useState<boolean>(false);
  const [usinghastiMd, setUsinghastiMd] = useState<boolean>(false);


  function classNames(...classes: String[]) {
    return classes.filter(Boolean).join(' ')
  }


  const handleIconChange = (file: File | null) => {
    if (file) {
      setIconImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setIconPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBgImageChange = (file: File | null) => {
    if (file) {
      setBackgroundImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setBgImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {

    // Check if user has setup the HASTI GitHub app to access their repositories
    // Ie will check if the user has a github token, needed to access the GitHub API. (GHU_token)
    if(opened){
      axios({
        url: `${process.env.API_URL}/api/v1/auth/gitUserToken`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user.jwt}`
        },
        timeout: 60000,
        timeoutErrorMessage: 'Request timed out. Please try again.',
      }).catch(error => {
        const data: CheckAuthResponse = error.response.data;
        console.error('data', data)
        let message: string = ''
        if (data.check === AuthCheckType.USER_OK) {
          message = 'Error checking GitHub token. Please try again, try refreshing the page, or logging out and back in.'
        } else if (data.check === AuthCheckType.TOKEN_EXIST) {
          message = "You have not setup the HASTI GitHub app to access your repositories. Please setup the GitHub app to continue."
        } else if (data.check === AuthCheckType.DECRYPT) {
          message = 'Your GitHub token has expired. Please setup the HASTI GitHub app to access your repositories.'
        }
        setGhuTokenOkResponse({ success: false, message: message, check: data.check })
        setGhuTokenOkDialogOpen(true)
        console.error('Error with GET /api/v1/auth/gitUserToken:', error)

      });
    }



    // Reset state back to idle when the modal is closed
    if (!opened) {
      setProjectLoadedState({ projects, reqStatus: 'idle', setSearchProps })
    }
    if (opened) {
      fetchProjects = {
        limit: 1,
        projectID: projectID,
        allContent: true,
      }
      console.log('projectID 1111:', projectID)

      setSearchProps(fetchProjects)
    }



  }, [opened])

  useEffect(() => {

    setProjectLoadedState({ projects, reqStatus, setSearchProps })

    // Set the project info if the project is loaded
    if (projectID && projects && projects.length > 0) {
      const loadedProject = projects[0] as ProjectAllInfo;

      if (loadedProject) {
        console.log("loadedProject test: ", loadedProject)
        setSelectedRepo(loadedProject.repo);
        form.values.projectName = loadedProject.title;
        setProjectType(getProjectType(loadedProject.projectType));
        form.values.description = loadedProject.description;

        const instalTypes: HAInstallType[] = [];

        if (loadedProject.worksWithContainer) {
          instalTypes.push(HAInstallType.CONTAINER);
        }

        if (loadedProject.worksWithCore) {
          instalTypes.push(HAInstallType.CORE);
        }

        if (loadedProject.worksWithOS) {
          instalTypes.push(HAInstallType.OS);
        }

        if (loadedProject.worksWithSupervised) {
          instalTypes.push(HAInstallType.SUPERVISED);
        }


        if (instalTypes.length === getAllHaInstallTypes().length -1) {
          setHaInstallTypes([HAInstallType.ANY]);
        }else{
          setHaInstallTypes(instalTypes);
        }
        setTags(loadedProject.tags.map((tag) => tag.name))

        const imageHostPrefix = process.env.USER_CONTENT_URL;
        if (loadedProject.iconImage) {
          setIconPreview(`${imageHostPrefix}/${loadedProject.iconImage}`)
        }
        if (loadedProject.backgroundImage) {
          setBgImagePreview(`${imageHostPrefix}/${loadedProject.backgroundImage}`)
        }

        setUsinghastiMd(loadedProject.usingHastiMD)

        if(opened){
            const repoID = loadedProject?.repoID

          axios({
            url: `${process.env.API_URL}/api/v1/repos/${repoID}/hasFile?path=HASTI.md`,
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.user.jwt}`
            },
            timeout: 60000,
            timeoutErrorMessage: 'Request timed out. Please try again.',
          }).then(response => {
            console.log('response:', response)
            if(response.status === 200){
              const hastiMdResponse: RefreshContentResponse = response.data
              setHastiMdAvailable(hastiMdResponse.success)
            }else if(response.status === 204){
              setHastiMdAvailable(false)
            }
          }).catch(error => {
            const hastiMdResponse: RefreshContentResponse = error.data
            console.error('Error with GET /api/v1/repos/:repoID/hasFile?path=HASTI.md', error)
            setHastiMdAvailable(hastiMdResponse.success)
          })
        }


      }

    }

  }, [projects])


  // This regex is used to validate the importRepoURL field has a valid GitHub repository URL format.
  const importRepoURLRegex = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+?$/

  function validateProjectName(value: string | undefined) {
    if (!value) {
      console.log('value is undefined')
      value = selectRepo?.name.trim()
      form.values.projectName = value
    }
    console.log('value:', value)

    let retVal = null
    if (!selectRepo) {
      console.log(value)
      console.log(importRepoURLRegex.test(form.values.importRepoURL))
      retVal = 'Select a repository for your project.'

      if (!importRepoURLRegex.test(form.values.importRepoURL)) {
        retVal = null
      }
    }

    if (value === undefined || value.length < 3) {
      retVal = 'Project name must have at least 3 characters.'
    }

    if (selectRepo?.name && selectRepo?.name.length < 3) {
      retVal = 'Project name must have at least 3 characters 1.'
    }

    if (value && !isValidProjectName(value)) {
      retVal = 'Invalid project name. Project names must be alphanumeric, and may contain spaces, dashes, and underscores.'
    }

    if (value !== undefined && value.length > 3 && importRepoURLRegex.test(form.values.importRepoURL)) {
      retVal = null
    }

    return retVal

  }


  function validateHasInstallTypes() {
    form.values.haInstallTypes = haInstallTypes
    console.log('value', haInstallTypes)
    const errorMessage: string = 'Please select an install type.'
    if (haInstallTypes === undefined || haInstallTypes.length <= 0) {
      return errorMessage
    }

    for (const installType of haInstallTypes) {
      console.log('installType', installType)
      console.log('allInstallTypes', getAllHaInstallTypes())
      if (!getAllHaInstallTypes(false).includes(installType.toString().toLowerCase())) {
        return errorMessage
      }
    }
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const form = useForm({
    initialValues: {
      importRepoURL: '',
      projectName: selectRepo?.name,
      projectType: projectType,
      haInstallTypes: haInstallTypes,
      description: '',
      tags: [''],
      iconImage: null,
      backgroundImage: null,
    },
    validate: {
      // Handle repo and project name validation
      projectName: (value: string | undefined) => (validateProjectName(value)),
      importRepoURL: (value: string) => (value.length > 0 && selectRepo === null ?
        importRepoURLRegex.test(value) ? null : 'Enter a valid GitHub repository URL. Example: \'https://github.com/home-assistant/core\''
        : value.length === 0 && selectRepo !== null ? null : 'Please select a repository or enter a valid GitHub repository URL.'),
      projectType: (value: ProjectType | undefined) => (projectType === undefined ? 'Please select a project type.' : null),
      haInstallTypes: (value: HAInstallType[] | undefined) => (validateHasInstallTypes()),
      description: (value: string) => (value.length < 30 ? `Description too short. Must have at least 30 characters. You have ${value.length}` : null),
      tags: (value: string[]) => (tags.length < 3 ? 'Please select at least 3 tags, but less than 50.' : tags.length > 50 ? 'Must have less than 50 tags' : null),
      iconImage: (value: File | null) => (iconImage !== null && iconImage.size > MAX_FILE_SIZE ? 'File too big. Max size is 10MB' : null),
      backgroundImage: (value: File | null) => (backgroundImage !== null && backgroundImage.size > MAX_FILE_SIZE ? 'File too big. Max size is 10MB' : null),
    },

  });



  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const fetchPopularTags = async () => {
      const searchParams = new URLSearchParams({
        q: '*', // Get most popular tags
        query_by: 'name',
        filter_by: `type:${projectType?.toLowerCase()}`,
        include_fields: 'name,type',
        highlight_fields: 'name', // Hacky way to get API to not send highlight fields in response to save response size

        per_page: '10'
      })

      const res = await axios({
        url: `${process.env.API_URL}/api/v1/tags/search?` + searchParams,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user.jwt}`
        },
        timeout: 30000,
        timeoutErrorMessage: 'Request timed out. Please try again.',
      })


      const tagSearchResponse: TagSearchResponse = res.data


      if (res.status === 200 && tagSearchResponse.hits && tagSearchResponse.hits.length > 0) {
        const currPopularTags = tagSearchResponse.hits.map((hit) => hit.document.name)
        console.log('popularTags:', currPopularTags)
        setExistingTags(currPopularTags)
      }
    }

    if (opened) {
      fetchPopularTags()
    }

  }, [opened, projectType]);


  const searchParams: SearchParams = {
    q: '*',
    query_by: 'name',
    filter_by: `type:${projectType?.toLowerCase()}`,
    include_fields: 'name,type',
    highlight_fields: 'name', // Hacky way to get API to not send highlight fields in response to save response size
    // sort_by: 'projectsUsing:desc',
    typo_tokens_threshold: 3,
  }

  const getInputProps: any = (fieldName: string) =>
    form.getInputProps(fieldName);



  async function createProject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const newProjectRequest: any = {
      repository: selectRepo,
      name: form.values.projectName,
      type: projectType,
      description: form.values.description,
      tags: tags,
      icon: iconImage,
      background: backgroundImage,
    }
    const formData = new FormData();
    let repoURL: string = ''
    let addMethod: string = ''
    let validImportRepoURL: boolean = false

    if (!form.validate().hasErrors && selectRepo && projectType) {
      setLoading(true)
      form.values.importRepoURL = '';
      setProjectResponse({ success: false, message: '' })

      formData.append('repositoryID', selectRepo?.id)

      formData.append('name', form.values.projectName || selectRepo.name)
      addMethod = 'repo_select'  //Set the function to add a project by repo

      validImportRepoURL = true


    } else if (!form.validate().hasErrors && importRepoURLRegex.test(form.values.importRepoURL) && projectType) {
      const defaultName: string = form.values.importRepoURL.split('/').pop() || session?.user.name + "'s project-" + uuidv4().slice(0, 5)
      formData.append('name', form.values.projectName ? form.values.projectName : defaultName)
      addMethod = 'url_import' //Set the function to add a project by repo

      validImportRepoURL = true
    }

    // set project repo URL
    if (selectRepo) {
      repoURL = `https://github.com/${selectRepo.fullName}`
    } else {
      repoURL = form.values.importRepoURL
    }

    // Error missing fields
    if (!validImportRepoURL || !projectType || !haInstallTypes || !form.values.description || tags.length < 3 || !form.values.projectName) {
      setLoading(false)
      let missingFields: string = ''
      !projectType ? missingFields += 'Project type, ' : null
      !haInstallTypes || haInstallTypes.length <= 0 ? missingFields += 'Install type, ' : null
      !form.values.description ? missingFields += 'Description, ' : null
      tags.length < 3 ? missingFields += 'Need to have 3 or more tags, ' : null
      !form.values.projectName ? missingFields += 'Project name, ' : null

      setProjectResponse({ success: false, message: `Please fill out all required fields. Missing fields: ${missingFields}` })
      return
    }


    formData.append('repoURL', repoURL)
    formData.append('addMethod', addMethod)

    formData.append('projectType', projectType ? projectType : ProjectType.OTHER)
    formData.append('haInstallType', haInstallTypes.join(','))

    formData.append('description', form.values.description)
    formData.append('tags', tags.join(','))

    if (projectID) {
      formData.append('projectID', projectID)
    }

    formData.append('usinghastiMd', String(usinghastiMd))

    iconImage ? formData.append('iconImage', iconImage) : null
    backgroundImage ? formData.append('backgroundImage', backgroundImage) : null

    // If the projectID exists (meaning we want to update an existing project), then we are updating the project
    const METHOD = projectID ? 'PUT' : 'POST'

    try {
      axios({
        url: `${process.env.API_URL}/api/v1/projects`,
        data: formData,
        method: METHOD,
        headers: {
          "Content-Type": "multipart/form-data",
          'Authorization': `Bearer ${session?.user.jwt}`
        },
        timeout: 60000,
        timeoutErrorMessage: 'Request timed out. Please try again.',
      })
        .then(response => {
          // Handle the response data
          console.log('Data retrieved successfully:', response.data);
          console.log("/api/v1/projects response:", response)
          const responseBody: AddProjectResponse = response.data
          setProjectResponse(responseBody)
          if (response.status === 413) {

            if (responseBody.extraInfo && !responseBody.extraInfo.includes('iconImage') || (!responseBody.extraInfo && iconImage)) {
              form.setErrors({ iconImage: responseBody.message })
            }
            if (responseBody.extraInfo && !responseBody.extraInfo.includes('backgroundImage') || (!responseBody.extraInfo && backgroundImage)) {
              form.setErrors({ backgroundImage: responseBody.message })
            }
            if (!responseBody.extraInfo || (!responseBody.extraInfo.includes('iconImage') && !responseBody.extraInfo.includes('backgroundImage'))) {
              form.setErrors({ iconImage: responseBody.message, backgroundImage: responseBody.message })
            }

          }
        })
        .catch(error => {
          // Handle errors, including timeouts
          const responseBody: AddProjectResponse = error.response ? error.response.data : { success: false, message: error.message }
          setProjectResponse(responseBody)
          if (error.response.status === 413) {

            if (responseBody.extraInfo && !responseBody.extraInfo.includes('iconImage') || (!responseBody.extraInfo && iconImage)) {
              form.setErrors({ iconImage: responseBody.message })
            }
            if (responseBody.extraInfo && !responseBody.extraInfo.includes('backgroundImage') || (!responseBody.extraInfo && backgroundImage)) {
              form.setErrors({ backgroundImage: responseBody.message })
            }
            if (!responseBody.extraInfo || (!responseBody.extraInfo.includes('iconImage') && !responseBody.extraInfo.includes('backgroundImage'))) {
              form.setErrors({ iconImage: responseBody.message, backgroundImage: responseBody.message })
            }

          }

          if (error.code === 'ECONNABORTED') {
            console.error(`Error with ${METHOD} /api/v1/projects:`, error.message)
            setProjectResponse({ success: false, message: error.message })
          } else {
            console.error(`Error with ${METHOD} /api/v1/projects:`, error)
            setProjectResponse({ success: false, message: responseBody.message })
          }
        }).finally(() => {
          setCreateProjectDialogOpen(true)
          setLoading(false)
        })
    } catch (e) {
      console.error(`Error with ${METHOD} /api/v1/projects:`, e)
    }




  }

  useEffect(() => {
    form.values.importRepoURL = '';

  }, [selectRepo])

  function onProjectCreateConfirm() {
    if (projectResponse.success) {
      close()
      // Reload page
      window.location.reload()
    }
  }

  function onDeleteDialogConfirm() {
    axios({
      url: `${process.env.API_URL}/api/v1/projects/${projectID}`,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.user.jwt}`
      },
      timeout: 60000,
      timeoutErrorMessage: 'Request timed out. Please try again.',
    }).then(response => {
      close()
      // Reload page
      window.location.reload()
    }).catch(error => {
      console.error('Error with DELETE /api/v1/projects/:projectID:', error)
    });

  }

  function handleDeletedDialogOpen(e: any) {
    e.preventDefault()
    setDeleteProjectDialogOpen(true)
    console.log('=custom')
  }


  function onClaimDialogConfirm() {
    axios({
      url: `${process.env.API_URL}/api/v1/projects/claim/${projectID}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.user.jwt}`
      },
      timeout: 60000,
      timeoutErrorMessage: 'Request timed out. Please try again.',
    }).then(response => {
      close()
      // Reload page
      window.location.reload()
    }).catch(error => {
      console.error('Error with PUT /api/v1/projects/:projectID:', error)
    });

  }

  function handleClaimDialogOpen(e: any) {
    e.preventDefault()
    setClaimProjectDialogOpen(true)
  }

  function handleRepoRefreshDialogOpen(e: any) {
    e.preventDefault()
    const project = projects && projects[0] as ProjectAllInfo
    const repoID = project?.repoID
    axios({
      url: `${process.env.API_URL}/api/v1/repos/${repoID}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.user.jwt}`
      },
      timeout: 60000,
      timeoutErrorMessage: 'Request timed out. Please try again.',
    }).then(response => {
      const refreshResponse: RefreshRepoDataRequest = response.data

      setRefreshRepoResponse(refreshResponse)
    }).catch(error => {
      const refreshResponse: RefreshRepoDataRequest = error.data
      setRefreshRepoResponse(refreshResponse)
      console.error('Error with PUT /api/v1/repos/refresh/:repoID', error)
    });

    setRefreshRepoDialogOpen(true)
  }


  function handleREADMERefreshDialogOpen(e: any) {
    e.preventDefault()
    const project = projects && projects[0] as ProjectAllInfo
    const projectID = project?.id
    let updateContentFile = ''
    if(usinghastiMd){
      updateContentFile = 'HASTI'
    }else{
      updateContentFile = 'README'
    }
    axios({
      url: `${process.env.API_URL}/api/v1/projects/${projectID}/content?updateContentFile=${updateContentFile}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.user.jwt}`
      },
      timeout: 60000,
      timeoutErrorMessage: 'Request timed out. Please try again.',
    }).then(response => {
      const refreshResponse: RefreshContentResponse = response.data
      setRefreshContentResponse(refreshResponse)
    }).catch(error => {
      const refreshResponse: RefreshContentResponse = error.data
      setRefreshContentResponse(refreshResponse)
      console.error('Error with PUT /api/v1/projects/:projectID/content', error)
    });

    setRefreshContentDialogOpen(true)
  }

  function isOwnerAndNotClaimed() {
    const project = projects && projects[0] as ProjectAllInfo
    const isOwner = project?.repo.ownerGithubID === session?.user.githubID
    console.log('isOwner:', isOwner)
    console.log('project?.claimed:', project?.claimed)
    return isOwner && project?.claimed === false
  }

  function isOwner() {
    const project = projects && projects[0] as ProjectAllInfo
    const isOwner = project?.repo.ownerGithubID === session?.user.githubID
    return isOwner
  }

  function renderClaimButton() {
    return (

      !isOwner() ? null : <div>
        {/* Claim Project Dialog */}
        <DialogPanel
          title="Claim project"
          message={"Claiming a project will give you ownership of the project. You will be able to edit, configure and delete the project. The current owner will lose access, are you sure you want to claim this project?"}
          open={claimProjectDialogOpen}
          setOpen={setClaimProjectDialogOpen}
          confirmBtnText='Claim Project'
          cancelBtnText='Cancel'
          onCancel={null}
          onConfirm={onClaimDialogConfirm}
          customAction={null}
          customBtnText=''
          stateType={'confirm'}
        />
        <p className='text-lg font-extrabold py-2'>Would you like to claim this project?</p>
        Claiming this project means:
        <ul className='list-disc pl-5 py-5'>
          <li> You will be the owner of this project</li>
          <li> You will be able to edit the project</li>
          <li> You will be able to delete this project</li>
        </ul>
        <button
          // flex items-center bg-dark text-white font-bold py-2 pl-3 -ml-1 rounded-2xl focus:outline-none focus:shadow-outline-gray hover:bg-gray-700 w-full
          className={'my-3 bg-dark text-white group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold w-full justify-center items-center hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600'}
          onClick={(e) => handleClaimDialogOpen(e)}
        >
          <UserPlusIcon
            className={'text-white group:hover:text-black h-6 w-6 shrink-0'}
            aria-hidden="true"
          />
          Claim Project
        </button>
      </div>

    )
  }

  function handleGitHubAppSetup() {
    window.open(`https://github.com/apps/${GIT_APP_NAME}/installations/new?state=${session?.user?.id}`)
  }


  async function handleExportHastiMd(e: React.MouseEvent<HTMLButtonElement>) {
    const project = projects && projects[0] as ProjectAllInfo
    e.preventDefault()
    if(project){
      const dlResponse:GetContentResponse = await downloadHASTIData(project.id, project.contentSHA)
      console.log('dlResponse:', dlResponse)
      setExportHastiMDResponse(dlResponse)
      setExportHastiMDDialogOpen(true)   
    }
  }

  return (
    <>
      {/* GitHub App issue dialog */}
      <DialogPanel
        title="GitHub Token Check"
        message={ghuTokenOkResponse.message}
        open={ghuTokenOkDialogOpen}
        setOpen={setGhuTokenOkDialogOpen}
        confirmBtnText='ok'
        cancelBtnText=''
        onCancel={() => { }}
        onConfirm={() => { }}
        customAction={handleGitHubAppSetup}
        customBtnText={"Set Up GitHub App"}
        stateType={'error'}
      />
      {/* Adding project dialog */}
      <DialogPanel
        title={projectID? "Updating project" : "New Project"}
        message={projectResponse.message}
        open={createProjectDialogOpen}
        setOpen={setCreateProjectDialogOpen}
        confirmBtnText='ok'
        cancelBtnText=''
        onCancel={() => { }}
        onConfirm={onProjectCreateConfirm}
        customAction={() => { }}
        customBtnText=''
        stateType={projectResponse.success ? 'success' : 'error'}
      />
      {/* Export HASTI.md dialog */}
      <DialogPanel
        title="Export HASTI.md"
        message={exportHastiMDResponse && exportHastiMDResponse.success ? 'HASTI.md exported successfully.' : 'Error exporting HASTI.md.'}
        open={exportHastiMDDialogOpen}
        setOpen={setExportHastiMDDialogOpen}
        confirmBtnText='ok'
        cancelBtnText=''
        onCancel={() => { }}
        onConfirm={() => { }}
        customAction={() => { }}
        customBtnText=''
        stateType={exportHastiMDResponse ? exportHastiMDResponse.success ? 'success' : 'error' : 'pending'}
      />
      <Box pos="relative">

        <Modal
          size={'75vw'}
          opened={opened}
          onClose={close}
          title={projectID ? "Project Settings" : "Create new Project"}
          overlayProps={{
            backgroundOpacity: 0.55,
            blur: 3,
            zIndex: 100,
          }}>

          <form onSubmit={createProject}>

            <div className="space-y-12 z-10">
              <LoadingOverlay visible={!projectID || (projectLoadedState
                && projectLoadedState.reqStatus === "success"
                && projectLoadedState?.projects
                && projectLoadedState?.projects.length > 0) ? false : true} zIndex={1000} overlayProps={{ radius: "xl", blur: 2, center: true }}
                className='fixed'
              />
              {isOwnerAndNotClaimed() ? renderClaimButton() : <div className="border-b border-gray-900/10">
                {/* <h2 className="text-base font-semibold leading-7 text-gray-900">New Project</h2> */}

                <div className="text-black">
                  <div className="">
                    <div className='grid grid-cols-1 md:grid-cols-2'>

                      <div className="mt-2">
                        <SelectRepo selectRepo={selectRepo} setSelectRepo={setSelectedRepo} disabled={projectID ? true : false} />

                        <div className="relative py-3">
                          <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-300" />
                          </div>
                          <div className="relative flex justify-center">
                            <span className="bg-white px-2 text-sm text-gray-500">or import 3rd party repository</span>
                          </div>
                        </div>

                        <TextInput className="w-full" placeholder="full repository URL" {...form.getInputProps('importRepoURL')} onFocus={(e) => setSelectedRepo(null)} disabled={projectID ? true : false} />

                      </div>
                      <div className='grid grid-cols-1 md:grid-cols-2 '>

                        {/* Add content to right */}
                        <div className='md:pl-5 col-span-2'>
                          <div className='md:pt-3'>
                            <ImageUploadHelp/>
                          </div>

                          <div className='grid grid-cols-2 space-x-1.5 h-full my-auto pb-6'>




                            <div className="flex justify-center rounded-lg border border-dashed border-gray-900/25 relative"
                              style={{ backgroundImage: `url(${iconPreview?.toString()})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>

                              <div className="text-center z-10 backdrop-blur-sm bg-white/30 rounded-lg h-full w-full flex justify-center items-center">
                                <div className="text-center">
                                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                                  <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                                    <label
                                      htmlFor="icon-upload"
                                      className={classNames('relative cursor-pointer rounded-mdfont-semibold focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 ', iconImage ? 'text-indigo-400 focus-within:ring-indigo-500 hover:text-indigo-500' : 'text-indigo-600 focus-within:ring-indigo-600 hover:text-indigo-500')}
                                    >
                                      <span>Upload an Icon</span>
                                      <FileInput
                                        id="icon-upload"
                                        styles={{
                                          input: {
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            opacity: 0,
                                            cursor: 'pointer',
                                          },
                                        }}
                                        onChange={handleIconChange}
                                        accept="image/png,image/jpeg"
                                        error={form.getInputProps('iconImage').error}
                                      />
                                    </label>
                                  </div>
                                  <p className={classNames('text-xs leading-5', iconImage ? 'text-white' : 'text-gray-600')}>PNG, JPG up to 10MB</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-center rounded-lg border border-dashed border-gray-900/25 relative"
                              style={{ backgroundImage: `url(${bgImagePreview?.toString()})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>

                              <div className="text-center z-10 backdrop-blur-sm bg-white/30 rounded-lg h-full w-full flex justify-center items-center">
                                <div className="text-center">
                                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                                  <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                                    <label
                                      htmlFor="background-upload"
                                      className={classNames('relative cursor-pointer rounded-mdfont-semibold focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 ', backgroundImage ? 'text-indigo-400 focus-within:ring-indigo-500 hover:text-indigo-500' : 'text-indigo-600 focus-within:ring-indigo-600 hover:text-indigo-500')}
                                    >
                                      <span>Upload a Background</span>
                                      <FileInput
                                        id="background-upload"
                                        styles={{
                                          input: {
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            opacity: 0,
                                            cursor: 'pointer',
                                          },
                                        }}
                                        onChange={handleBgImageChange}
                                        accept="image/png,image/jpeg"
                                        error={form.getInputProps('iconImage').error}
                                      />
                                    </label>
                                  </div>
                                  <p className={classNames('text-xs leading-5', backgroundImage ? 'text-white' : 'text-gray-600')}>PNG, JPG up to 10MB</p>
                                </div>
                              </div>
                            </div>




                          </div>
                        </div>

                      </div>
                      <div className='grid grid-cols-1 md:grid-cols-2 md:space-x-3 md:divide-x-2 divide-dashed py-2'>

                        <div className="">
                          <ProjectNameHelp/>
                          <TextInput id={projects ? projects[0]?.id : selectRepo?.id} className="w-full" placeholder={selectRepo?.name} defaultValue={selectRepo?.name} {...form.getInputProps('projectName')} disabled={projectID ? true : false} />

                        </div>

                        <div className="pt-3 md:pt-0 md:pl-3">
                          <ProjectTypeHelp/>
                          <ProjectTypeSelectDropdownBox projectType={projectType} setProjectType={setProjectType} inputProps={getInputProps} disabled={projectID ? true : false} />

                        </div>

                      </div>
                    </div>
                  </div>

                  <div className="relative py-5">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-2 text-sm text-gray-500">Help people find your cool {projectType ?
                        projectType === ProjectType.OTHER ? '...thing? 🤔'
                          : projectType.toString()
                        : 'project'}</span>
                    </div>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-7 md:space-x-3 md:divide-x-2 md:divide-dashed'>
                    <div className='col-span-3'>



                      <div className="col-span-full">

                        <div className="mt-2">
                          <DescriptionHelp/>
                          <Textarea
                            placeholder="Short description of the project."
                            autosize
                            minRows={4}
                            maxRows={4}
                            {...form.getInputProps('description')}
                          />
                        </div>
                        <p className="mt-3 text-sm leading-6 text-gray-600">Write a short description. Recommended ~20 words. Min 30 characters.</p>
                      </div>
                    </div>
                    <div className="md:pl-5 col-span-2">

                      <div className="mt-2 text-black">
                        <HAInstallTypeSelectDropdownBox haInstallTypes={haInstallTypes} setHaInstallTypes={setHaInstallTypes} inputProps={getInputProps} />
                      </div>
                      <div className="pt-1.5">
                        <TagsHelp/>
                        <SearchTagComboBox
                          placeholder="Select or add a tag..."
                          searchable={true}
                          nothingFoundMessage='Nothing found... Add to create a new tag, space delimited'
                          existingTags={existingTags}
                          tags={tags} setTags={setTags}
                          searchParams={searchParams}
                          maxSelectedValues={10}
                          inputProps={getInputProps}
                        />
                      </div>
                    </div>

                    <div className="col-span-2 md:pl-5 grid place-items-center">
                      <span>
                        <ContentSwitchHelp/>
                        <div className='flex justify-center text-center p-3 cursor-pointer'>
                          <Switch size="xl" onLabel={"HASTI.md"} offLabel={"README.md"} className='-mt-1 px-2' disabled={!hastiMdAvailable} 
                          checked={usinghastiMd} onChange={(event) => setUsinghastiMd(event.currentTarget.checked)}/>
                        </div>
                        </span>

                        <Button 
                        rightSection={<IconDownload size={14} className='text-black'/>} 
                        className='text-black border-1 border-gray-700 mt-5'
                        onClick={(e) => {handleExportHastiMd(e)}}>
                          Export Hasti.md
                        </Button>

                      </div>

                  </div>






                </div>
                {/* Refresh README Dialog */}
                <DialogPanel
                  title="README Refresh"
                  message={refreshContentResponse ? refreshContentResponse.message : ''}
                  open={refreshContentDialogOpen}
                  setOpen={setRefreshContentDialogOpen}
                  confirmBtnText='Ok'
                  cancelBtnText=''
                  onCancel={null}
                  onConfirm={() => {
                    setTimeout(() => {
                      // Wait 1 second to reset the response so closing animation can play
                      setRefreshContentResponse(null); // Reset to null, null is used for the loading state
                    }, 500);
                  }}
                  customAction={null}
                  customBtnText=''
                  stateType={refreshContentResponse ? refreshContentResponse?.success ? 'success' : 'error' : 'pending'}
                />
                {/* Refresh Repo Dialog */}
                <DialogPanel
                  title="Repository Refresh"
                  message={refreshRepoResponse ? refreshRepoResponse?.message : ''}
                  open={refreshRepoDialogOpen}
                  setOpen={setRefreshRepoDialogOpen}
                  confirmBtnText='Ok'
                  cancelBtnText=''
                  onCancel={null}
                  onConfirm={() => {
                    setTimeout(() => {
                      // Wait 1 second to reset the response so closing animation can play
                      setRefreshRepoResponse(null); // Reset to null, null is used for the loading state
                    }, 500);
                  }}                  
                  customAction={null}
                  customBtnText=''
                  stateType={refreshRepoResponse ? refreshRepoResponse?.success ? 'success' : 'error' : 'pending'}
                />
                {/* Delete Dialog */}
                <DialogPanel
                  title="Delete project"
                  message={"Are you sure you want to delete this project?"}
                  open={deleteProjectDialogOpen}
                  setOpen={setDeleteProjectDialogOpen}
                  confirmBtnText='Delete Project'
                  cancelBtnText='Cancel'
                  onCancel={null}
                  onConfirm={onDeleteDialogConfirm}
                  customAction={null}
                  customBtnText=''
                  confirmActionText={`delete ${form.values.projectName}`}
                  stateType={'confirm'}
                />
                {
                  !projectID || !(projectLoadedState
                    && projectLoadedState.reqStatus === "success"
                    && projectLoadedState?.projects
                    && projectLoadedState?.projects.length > 0) ? null :
                    <div>

                      {/* <div className="relative py-5">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                          <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-white px-2 text-sm text-gray-500"></span>
                        </div>
                      </div> */}
                      <div className='grid grid-cols-4 space-x-1.5 h-full '>
                        <div className='col-span-4 md:col-span-1 order-last md:order-1'>
                          <div className="relative py-5">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                              <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center">
                              <span className="bg-white px-2 text-sm text-gray-500">Actions</span>
                            </div>
                          </div>
                          <button
                            // flex items-center bg-dark text-white font-bold py-2 pl-3 -ml-1 rounded-2xl focus:outline-none focus:shadow-outline-gray hover:bg-gray-700 w-full
                            className={'flex justify-normal text-center my-3 bg-white text-black group gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold w-full items-center hover:bg-gray-300 border border-zinc-500'}
                            onClick={(e) => handleREADMERefreshDialogOpen(e)}
                          >
                            <ArrowPathIcon
                              className={'text-black group:hover:text-black h-6 w-6 shrink-0'}
                              aria-hidden="true"
                            />
                            Refresh {hastiMdAvailable && usinghastiMd ? 'HASTI.md' : 'README.md'}
                          </button>
                          <button
                            // flex items-center bg-dark text-white font-bold py-2 pl-3 -ml-1 rounded-2xl focus:outline-none focus:shadow-outline-gray hover:bg-gray-700 w-full
                            className={'flex justify-normal text-center my-3 bg-dark text-white group gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold w-full items-center hover:bg-gray-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'}
                            onClick={(e) => handleRepoRefreshDialogOpen(e)}
                          >
                            <ArrowPathIcon
                              className={'text-white group:hover:text-black h-6 w-6 shrink-0 '}
                              aria-hidden="true"
                            />
                            Refresh Repo Data
                          </button>
                          <button
                            className={'flex justify-normal text-center my-3 bg-red-400 text-white group  gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold w-full items-center hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600'}
                            onClick={(e) => handleDeletedDialogOpen(e)}
                          >
                            <TrashIcon
                              className={'text-white group:hover:text-black h-6 w-6 shrink-0'}
                              aria-hidden="true"
                            />
                            Delete Project
                          </button>
                        </div>
                        <div className='col-span-4 md:col-span-3 order-1'>
                          <div className="relative py-5">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                              <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center">
                              <span className="bg-white px-2 text-sm text-gray-500">More settings</span>
                            </div>
                          </div>
                          <div className='justify-center items-center text-center text-gray-500 py-auto'>
                            More settings coming soon...
                            <p className='text-gray-400 text-sm'>When they are added, they will show here</p>
                          </div>
                        </div>
                      </div>
                    </div>
                }
              </div>
              }



            </div>
            <div className={isOwnerAndNotClaimed() ? 'hidden' : 'mt-6 flex justify-end'}>
              <div className="items-center justify-end gap-x-6">

                <Button type="button" className="text-sm font-semibold leading-6 text-gray-900" onClick={e => close()}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  tabIndex={1}
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  loading={loading}
                >
                  Save
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      </Box>
    </>



  )
}
