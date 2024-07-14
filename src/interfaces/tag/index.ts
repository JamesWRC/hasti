import { GetPopularTagsQueryParams, PopularTagResponse } from "@/backend/interfaces/tag/request"
import { useDebouncedState } from "@mantine/hooks"

export interface PopularTags {
    reqStatus: string,
    tags: PopularTagResponse | null
    setSearchProps: (newValue: GetPopularTagsQueryParams) => void
  }