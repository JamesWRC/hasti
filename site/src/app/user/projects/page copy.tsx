'use client'
import {
  FolderPlusIcon,

} from '@heroicons/react/24/outline'

import { useDisclosure } from '@mantine/hooks';
import { Modal, Button } from '@mantine/core';
import SelectRepo from '@/components/repo/SelectRepo';
import { useEffect, useState } from 'react'

import { Repo } from '@/backend/interfaces/repo'



import { useForm } from '@mantine/form';
import { TextInput, Textarea,  } from '@mantine/core';
import { useSession } from 'next-auth/react'
import { TagSearchResponse } from '@/backend/interfaces/tag/request'
import SearchTagComboBox from '@/components/ui/SearchComboBox'
import { SearchParams } from 'typesense/lib/Typesense/Documents';
import { ProjectType, HAInstallType } from '@/backend/interfaces/project'
import { ProjectTypeSelectDropdownBox } from '@/components/ui/ProjectTypeSelectDropdownBox'

import { FileInput } from '@mantine/core';
import { HAInstallTypeSelectDropdownBox } from '@/components/ui/HAInstallTypeSelectDropdownBox'
import { AddProjectResponse, MAX_FILE_SIZE } from '@/backend/interfaces/project/request'


import ProjectGrid from '@/components/project/ProjectGrid';


export function CreateNewProject() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [opened, { open, close }] = useDisclosure(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [selectRepo, setSelectedRepo] = useState<Repo | null>(null)

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [projectType, setProjectType] = useState<ProjectType>();
  
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [haInstallType, setHaInstallType] = useState<HAInstallType>(HAInstallType.ANY);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [tags, setTags] = useState(['']);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [existingTags, setExistingTags] = useState(['']);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data: session, status } = useSession()

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [iconImage, setIconImage] = useState<File | null>(null);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [loading, setLoading] = useState<boolean>(false);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [projectResponse, setProjectResponse] = useState<AddProjectResponse>({success: true, message: ''});


  // eslint-disable-next-line react-hooks/rules-of-hooks
  const form = useForm({
    initialValues: {
      projectName: selectRepo?.name,
      projectType: projectType,
      haInstallType: haInstallType,
      description: '',
      tags: [''],
      iconImage: null,
      backgroundImage: null,
    },
    validate: {
      // Handle repo and project name validation
      projectName: (value:string | undefined) => (
        selectRepo === null ? "Select a repository for your project." : 
          value !== undefined && value.length < 3 ? 'Project name must have at least 3 characters.' :
          selectRepo?.name.length < 3 ? 'Project name must have at least 3 characters 1.' : null
          ),

      projectType: (value: ProjectType | undefined) => (projectType === undefined ? 'Please select a project type.' : null),
      haInstallType: (value: HAInstallType | undefined) => (haInstallType === undefined ? 'Please select an install type.' : null),
      description: (value: string) => (value.length < 30 ? `Description too short. Must have at least 30 characters. You have ${value.length}` : null),
      tags: (value: string[]) => (tags.length < 3 ? 'Please select at least 3 tags.' : null),
      iconImage: (value: File | null) => (iconImage !== null && iconImage.size > MAX_FILE_SIZE ? 'File too big. Max size is 10MB' : null),
      backgroundImage: (value: File | null) => (backgroundImage !== null && backgroundImage.size > MAX_FILE_SIZE ? 'File too big. Max size is 10MB' : null),
    },

  });

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const fetchPopularTags = async () => {

      const params = new URLSearchParams({
        q: '*', // Get most popular tags
        query_by: 'name',
        filter_by: 'type:integration',
        include_fields: 'name,type',
        highlight_fields: 'name', // Hacky way to get API to not send highlight fields in response to save response size
        
        per_page: '10'
      })

      const res = await fetch(`${process.env.API_URL}/api/tag/search?` + params, {
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

  const getInputProps: any = (fieldName:string) =>
    form.getInputProps(fieldName);



    async function createProject(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault()

      const newProjectRequest:any = {
        repository: selectRepo,
        name: form.values.projectName,
        type: projectType,
        description: form.values.description,
        tags: tags,
        icon: iconImage,
        background: backgroundImage,
      }
      const formData = new FormData();

      if(!form.validate().hasErrors && selectRepo && projectType){
        setLoading(true)
        setProjectResponse({success: false, message: ''})
        
        formData.append('repositoryID', selectRepo?.id)
        formData.append('projectType', projectType)
        formData.append('haInstallType', haInstallType)
        formData.append('name', form.values.projectName || selectRepo.name)
        formData.append('description', form.values.description)
        formData.append('tags', tags.join(','))
          if (iconImage) {
            formData.append('iconImage', iconImage);
          }
    
          if (backgroundImage) {
            formData.append('backgroundImage', backgroundImage);
          }

          
          const response = await fetch(`${process.env.API_URL}/api/project/add`, {
            method: 'POST',
            body: formData,
            headers: {
              'Authorization': `Bearer ${session?.user.jwt}`
            }
          });

          const responseBody:AddProjectResponse = await response.json()
          setProjectResponse(responseBody)
          if(response.status === 413){
            
            if(responseBody.extraInfo && !responseBody.extraInfo.includes('iconImage') || (!responseBody.extraInfo && iconImage)){
              form.setErrors({iconImage: responseBody.message})
            }
            if(responseBody.extraInfo && !responseBody.extraInfo.includes('backgroundImage') || (!responseBody.extraInfo && backgroundImage)){
              form.setErrors({backgroundImage: responseBody.message})
            }
            if(!responseBody.extraInfo || (!responseBody.extraInfo.includes('iconImage') && !responseBody.extraInfo.includes('backgroundImage'))){
              form.setErrors({iconImage: responseBody.message, backgroundImage: responseBody.message})
            }

          }

      }

      setLoading(false)

    }

  return (
    <div key={`create-new-project`} className="mx-auto col-span-1 relative isolate flex flex-col justify-end overflow-hidden rounded-2xl px-8 py-8 my-4 min-w-[10.5rem] sm:max-h-none max-h-[15rem]">
      <button
        type="button"
        className="relative block w-full h-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        onClick={open}
      >
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <FolderPlusIcon />
        </svg>
        <span className="mt-2 block text-sm font-semibold text-gray-900">New Project</span>
      </button>

      <Modal
        size={'xl'}
        opened={opened}
        onClose={close}
        title="Create new Project"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}>
        <form onSubmit={createProject}>
          <div className="space-y-12">
            <div className="border-b border-gray-900/10 pb-12">
              {/* <h2 className="text-base font-semibold leading-7 text-gray-900">New Project</h2> */}

              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-4">

                  <div className="mt-2">
                      <SelectRepo selectRepo={selectRepo} setSelectRepo={setSelectedRepo}/>
                  </div>
                </div>
                <div className="sm:col-span-4">

                  <div className="">
                    <TextInput className="w-full" label="Project Name" placeholder={selectRepo?.name} defaultValue={selectRepo?.name} {...form.getInputProps('projectName')} />

                  </div>
                </div>
                <div className="sm:col-span-4">

                  <div className="mt-2">
                    <ProjectTypeSelectDropdownBox projectType={projectType} setProjectType={setProjectType} inputProps={getInputProps}/>

                  </div>
                  <div className="mt-2">
                    <HAInstallTypeSelectDropdownBox projectType={haInstallType} setProjectType={setHaInstallType} inputProps={getInputProps}/>

                  </div>
                </div>

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
                  <p className="mt-3 text-sm leading-6 text-gray-600">Write a short description. Recommended ~30 words.</p>
                </div>
                <div className='sm:col-span-4'>

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
                <div className="col-span-full">

                  <div className="w-40">
                    <label htmlFor="cover-photo" className="block text-sm font-medium leading-6 text-gray-900">
                      Upload Images

                    </label>
                    <FileInput className='w-60' clearable label="Icon image" placeholder="" accept="image/png,image/jpeg" onChange={setIconImage} error={form.getInputProps('iconImage').error}/>

                  </div>
                </div>
                <div className="col-span-full">

                  <div className="w-40">
                    <label htmlFor="cover-photo" className="block text-sm font-medium leading-6 text-gray-900">
                    </label>
                    <FileInput className='w-60' clearable label="Background Image" placeholder="" accept="image/png,image/jpeg" onChange={setBackgroundImage} error={form.getInputProps('backgroundImage').error}/>
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
    </div>


  )
}



export default function Page() {

  return (
    <div className="bg-white py-24 sm:py-28 w-full">
      <div className="mx-auto max-w-[150%] px-6 lg:px-2">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl py-4">Your Packages</h2>
        </div>
        <div className=" w-full h-full">
        <CreateNewProject/>
              </div>
        <ProjectGrid/>
      </div>
    </div>

  )
}
