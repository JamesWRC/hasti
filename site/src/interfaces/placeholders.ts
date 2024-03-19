import { ProjectType } from "@/backend/interfaces/project"
import { Project } from "@/interfaces/project/index"

const shortDesc = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam at ipsum eu nunc commodo posuere et sit amet ligula. elit nec. Lorem ipsum dolor sit amet, consectetur.'
const shortDesc2 = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
const link = "https://www.github.com"
const projectLink = "Boost-your-conversion-rate"





export let groupPosts: Project[] = []
let i;
for(i = 0; i < 10; i++){

  const post: Project = {
    id: i,
    title: 'Boost your conversion rate',
    shortDesc: shortDesc,
    href: projectLink,
    description:
      'Illo sint voluptas. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel. Iusto corrupti dicta.',
    imageUrl:
      'https://images.unsplash.com/photo-1496128858413-b36217c2ce36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3603&q=80',
    date: 'Mar 16, 2020',
    datetime: '2020-03-16',
    projectType: ProjectType.THEME,
    author: {
      name: 'Michael Foster',
      imageUrl:
        'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      link: link,
    },

  }
  groupPosts.push(post)
}