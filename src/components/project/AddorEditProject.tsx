'use client'
import {
  FolderPlusIcon,
  PhotoIcon,

} from '@heroicons/react/24/outline'

import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Title, Group, Box, LoadingOverlay } from '@mantine/core';
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
import { AddProjectResponse, GetProjectsQueryParams, MAX_FILE_SIZE } from '@/backend/interfaces/project/request'


import ProjectGrid from '@/frontend/components/project/ProjectGrid';
import { v4 as uuidv4 } from 'uuid';
import { ProjectAddMethod, getProjectAddMethod, getAllProjectAddMethods } from '@/backend/interfaces/project/request';
import { LoadProjects } from '@/frontend/interfaces/project';
import isValidProjectName from '@/frontend/helpers/user';
import { IconSettings } from '@tabler/icons-react';
import Details from '@/frontend/components/store/content/Details';
import useProjects from '@/frontend/components/project';
import { User } from '@/backend/interfaces/user';
import { getHaInstallType } from '@/backend/interfaces/project/index';





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
    if(projectID && projects && projects.length > 0){
      const loadedProject = projects[0] as ProjectAllInfo;
      if(loadedProject){
        console.log("loadedProject test: ", loadedProject)
        setSelectedRepo(loadedProject.repo);
        form.values.projectName = loadedProject.title;
        setProjectType(getProjectType(loadedProject.projectType));
        form.values.description = loadedProject.description;

        const instalTypes: HAInstallType[] = [];

        if(loadedProject.worksWithContainer){
          instalTypes.push(HAInstallType.CONTAINER);
        }
        if(loadedProject.worksWithCore){
          instalTypes.push(HAInstallType.CORE);
        }
        if(loadedProject.worksWithOS){
          instalTypes.push(HAInstallType.OS);
        }
        if(loadedProject.worksWithSupervised){
          instalTypes.push(HAInstallType.SUPERVISED);
        }
        setHaInstallTypes(instalTypes);
        setTags(loadedProject.tags.map((tag) => tag.name))

        const imageHostPrefix = process.env.USER_CONTENT_URL;
        if(loadedProject.iconImage){
          setIconPreview(`${imageHostPrefix}/${loadedProject.iconImage}`)
        }
        if(loadedProject.backgroundImage){
          setBgImagePreview(`${imageHostPrefix}/${loadedProject.backgroundImage}`)
        }
      }

    }

  }, [projects])


  useEffect(() => {

    console.log('projectLoadedState:', projectLoadedState)

  }, [projectLoadedState])

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
        filter_by: 'type:integration',
        include_fields: 'name,type',
        highlight_fields: 'name', // Hacky way to get API to not send highlight fields in response to save response size

        per_page: '10'
      })

      const res = await fetch(`${process.env.API_URL}/api/v1/tags/search?` + searchParams, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user.jwt}`
        }
      })
      const tagSearchResponse: TagSearchResponse = await res.json()


      if (res.ok && tagSearchResponse.hits && tagSearchResponse.hits.length > 0) {
        const popularTags = tagSearchResponse.hits.map((hit) => hit.document.name)
        setExistingTags(popularTags)
      }
    }
    fetchPopularTags()

  }, []);


  const searchParams: SearchParams = {
    q: 'placeholder',
    query_by: 'name',
    filter_by: 'type:integration',
    include_fields: 'name,projectsUsing,type',
    highlight_fields: 'name', // Hacky way to get API to not send highlight fields in response to save response size
    sort_by: 'projectsUsing:desc',
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

    iconImage ? formData.append('iconImage', iconImage) : null
    backgroundImage ? formData.append('backgroundImage', backgroundImage) : null

    // If the projectID exists (meaning we want to update an existing project), then we are updating the project
    const METHOD = projectID ? 'PUT' : 'POST'
    const response = await fetch(`${process.env.API_URL}/api/v1/projects`, {
      method: METHOD,
      body: formData,
      headers: {
        'Authorization': `Bearer ${session?.user.jwt}`
      }
    });

    const responseBody: AddProjectResponse = await response.json()
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

    setLoading(false)

  }

  useEffect(() => {
    form.values.importRepoURL = '';

  }, [selectRepo])

  return (
    <Box pos="relative">
      <Modal
        size={'75vw'}
        opened={opened}
        onClose={close}
        title="Create new Project"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}>

        <form onSubmit={createProject}>

          <div className="space-y-12">
            <LoadingOverlay visible={!projectID || (projectLoadedState
              && projectLoadedState.reqStatus === "success"
              && projectLoadedState?.projects
              && projectLoadedState?.projects.length > 0) ? false : true} zIndex={1000} overlayProps={{ radius: "xl", blur: 2, center: true }}
              className='fixed'
            />
            <div className="border-b border-gray-900/10 pb-12">
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

                      <TextInput className="w-full" placeholder="full repository URL" {...form.getInputProps('importRepoURL')} onFocus={(e) => setSelectedRepo(null)} disabled={projectID ? true : false}/>

                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 space-x-3 divide-x-2 divide-dashed py-2'>

                      {/* Add content to right */}

                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 md:space-x-3 md:divide-x-2 divide-dashed py-2'>

                      <div className="">
                        <TextInput id={projects ? projects[0]?.id : selectRepo?.id} className="w-full" label="Project Name" placeholder={selectRepo?.name} defaultValue={selectRepo?.name} {...form.getInputProps('projectName')} disabled={projectID ? true : false}/>

                      </div>

                      <div className="pt-3 md:pt-0 md:pl-3">
                        <ProjectTypeSelectDropdownBox projectType={projectType} setProjectType={setProjectType} inputProps={getInputProps} disabled={projectID ? true : false}/>

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
                        <Textarea
                          placeholder="Short description of the project."
                          autosize
                          minRows={4}
                          maxRows={4}
                          label="Description"
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
                      <SearchTagComboBox label="Select tags"
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

                  <div className='md:pl-5 col-span-2'>

                    <div className='grid grid-cols-2 space-x-1.5 h-full'>

                      {/* <div className="w-full pt-1.5">
                      <FileInput clearable label="Icon image" placeholder="" accept="image/png,image/jpeg" onChange={setIconImage} error={form.getInputProps('iconImage').error} />
                    </div> */}
                      <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 relative"
                        style={{ backgroundImage: `url(${iconPreview?.toString()})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>

                        <div className="text-center z-10 backdrop-blur-sm bg-white/30 rounded-lg h-full w-full flex justify-center items-center">
                          <div className="text-center">
                            <PhotoIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                            <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                              <label
                                htmlFor="icon-upload"
                                className={classNames('relative cursor-pointer rounded-mdfont-semibold focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 ', iconImage ? 'text-indigo-400 focus-within:ring-indigo-500 hover:text-indigo-500' : 'text-indigo-600 focus-within:ring-indigo-600 hover:text-indigo-500')}
                              >
                                <span>Upload a Icon</span>
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
                      <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 relative"
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
                    {/* <div className="w-full pt-2">
                      <FileInput clearable label="Background Image" placeholder="" accept="image/png,image/jpeg" onChange={setBackgroundImage} error={form.getInputProps('backgroundImage').error} />
                    </div> */}
                  </div>
                </div>






              </div>
            </div>



          </div>
          <div className='mt-6 flex justify-between'>
            <div className='justify-start'>
              {projectResponse.success ?
                <p className="text-sm font-semibold leading-6 text-green-500 justify-start">{projectResponse.message}</p> :
                <p className="text-sm font-semibold leading-6 text-red-500 justify-start">{projectResponse.message}</p>}
            </div>
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


  )
}
