# User generated content
- all Icons should be 512px x 512px 


 


# Plans
- upload profile and backgroud image to r2.
- add arest of details to database with pending state
- create worker to go through any repos pending states
- for each pending repo:
  - 1. Clone repo
  - 2. Get README.md and parse markdown
    - IF bad markdown get error and send notification
  - 3. upload any other media linked in readme to readme and update links in readme format
- Allow a HASTi.md file to be used over README.md if in repo
- Allow download HASTI.md

- Add flow for users to add a project to HASTI even if they dont own it...
    - Would have to be careful about ownership etc. How could the owner request to remove it if they dont want it

# TODO
1. IMprove UI for add project
   1. Add little i icon on each input linking to a FAQ? that goes into detail
2. Possibly remove Install Type if not needed IE for blueprints tec

3. cursor for the /api/project API. Needs to be date (something unique and sequential)
  - May have to store this and previous cursor to speed up even more
  - see if curr and prev cursor is > or < then could do take + if > or - if <