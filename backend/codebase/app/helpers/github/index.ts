import logger from "../../logger";
import { getGitHubAppAuth } from "../auth/github";
import convoy from "../../clients/convoy";
import { GitHubRepoRequest } from "../../interfaces/repo";
import prisma from "../../clients/prisma/client";


async function getFailedConvoyWebhooks(failedWebHookEventIDs: string[], next_page_cursor?: string): Promise<string[]> {
    let query = 'status=Failure&perPage=1'
    if (next_page_cursor) {
        console.log(`Getting next page of failed webhook deliveries from Convoy instance...`)
        query += `&next_page_cursor=${next_page_cursor}`
    }

    await convoy.eventDeliveries.all(query).then(async (response) => {
        // Check if there are no more deliveries
        if (!response.data.content) {
            console.log('convoy - no more deliveries')
            return failedWebHookEventIDs
        }
        // Get the next page cursor
        const currCursor: string = response.data.pagination.next_page_cursor
        
        // Get the event IDs of the failed webhook deliveries
        response.data.content.map((delivery: any) => {
            failedWebHookEventIDs.push(delivery.uid)
        })

        // Check if there is only one delivery and it is the same as the next page cursor
        if(response.data.content.length === 1 && response.data.content[0].uid === next_page_cursor){
            console.log('convoy - Reached end of pagination.')
            return failedWebHookEventIDs
        }



        // Redeliver the failed webhook
        if(currCursor){
            failedWebHookEventIDs = await getFailedConvoyWebhooks(failedWebHookEventIDs, currCursor)
        }

    })
    
    return failedWebHookEventIDs

}

export async function redeliverFailedWebhookInvocations() {


    // Get all failed webhook calls, include pagination
    const appAuth = await getGitHubAppAuth()
    
    // List all failed webhook calls
    let failedWebhookInvocations: string[] = []
    let okWebhookInvocations: string[] = []
    console.log(`Redelivering failed webhooks from Convoy instance...`)
    let failedWebHookEventIDs: string[] = []
    failedWebHookEventIDs = await getFailedConvoyWebhooks(failedWebHookEventIDs)
    failedWebHookEventIDs = [...new Set(failedWebHookEventIDs)];

    // Redeliver the failed webhooks

    for (const eventID of failedWebHookEventIDs) {
        const reTryInvocationResponse = await convoy.eventDeliveries.resend(eventID).then((response) => {
            console.log('successfully redelivered webhook with GUID: ', eventID)
        }).catch((error) => {
            console.log('ERROR: failed to redeliver webhook with GUID: ', eventID)
        })
    }

    appAuth.paginate('GET /app/hook/deliveries').then(async (response) => {
        // See what failed or was OK
        for(const delivery of response){
            delivery.status !== 'OK' ? failedWebhookInvocations.push(delivery.guid) 
            : okWebhookInvocations.push(delivery.guid)
        }

        // remove ay ok webhook invocations
        for(const ok of okWebhookInvocations){
            const index = failedWebhookInvocations.indexOf(ok);
            if (index > -1) {
                failedWebhookInvocations.splice(index, 1);
            }
        }

        // Redeliver the failed webhooks
        // Remove duplicate failed webhook invocations by GUIDs
        failedWebhookInvocations = [...new Set(failedWebhookInvocations)]

        // NOTE. Reverse the array to redeliver IN ORDER
        for(const delivery of response.reverse()){
            if (failedWebhookInvocations.includes(delivery.guid)){
                console.log(`Redelivering failed webhook with GUID: ${delivery.guid}`)
                // Redeliver the failed webhook
                const reTryInvocationResponse = await appAuth.request('POST /app/hook/deliveries/{delivery_id}/attempts', {
                    delivery_id: delivery.id
                })
                try{
                    await prisma.webhookEvents.create({
                        data: {
                            webhookId: `github-${delivery.guid}`,
                            source: "github",
                        }
                    })
                }catch(error){
                    console.log('ERROR: failed to redeliver webhook with GUID: ', delivery.guid)
                }


                console.log('reTryInvocationResponse', reTryInvocationResponse)
                // if(reTryInvocationResponse.status === 201){
                //     logger.info(`Successfully redelivered webhook with GUID: ${delivery.guid}`)
            }
        }
    })
} 