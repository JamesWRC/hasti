import { NextApiRequest, NextApiResponse } from 'next';
import tsClient from '@/backend/clients/typesense';
import { SearchParams } from 'typesense/lib/Typesense/Documents';

export default async function searchTags(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        // Extract the search query from the request query parameters
        const query = req.query;
        console.log('query', query);

        let searchParameters = {
            'q'         : query.q as string,
            'query_by'  : query.query_by as string,
            ...query
          }

          console.log('searchParameters', searchParameters);


        const searchOptions = {
            cacheSearchResultsForSeconds: 60
        }

        // Perform the search using the Typesense client
        const searchResults = await tsClient.collections('Tag').documents().search(searchParameters, searchOptions);

        // Return the search results as the API response
        res.status(200).json(searchResults);
    } catch (error) {
        // Handle any errors that occur during the search
        console.error('Error searching tags:', error);
        res.status(500).json({ error: 'An error occurred while searching tags' });
    }
}