## Tasks

- [ ] MVP
    - [x] Card actions
        - edit
        - delete
        - move
        - reset history
    - [x] Deck actions in deck header
    - [ ] Editing card content

- [ ] Scheduling logic
    - [ ] states
    - [ ] scheduling, trivial algorithm
    - [ ] cram feature, and other manual revision stuff
        - cram
        - learn new cards
    - [ ] implement the SM2 algorithm
    - [ ] Add cards to review

- [ ] Templating
    - possibly through custom templating language
        - more fun to implement, write a parser and stuff
    - possibly through drag and drop builder
        - hard to implement
        - good way to constrain the flexibility
    - maybe using custom react components would be best
        - fully customisable, might be difficult to isolate

- [ ] Keyboard shortcuts
    - [ ] Review
    - [ ] Deck management
    - [ ] Card management
    - [ ] Page navigation
    - [ ] Navigating lists

- [ ] Management
    - [ ] Advanced filtering for cards
    - [ ] Sorting cards
    - [ ] Better text search everywhere

- [ ] Publish
    - Create database on startup

- [ ] Stats
    - [ ] Home page stats
    - [ ] Deck info stats, small widgets

- [ ] Different views for cards
    - Show and hide certain fields
    - Grid view
    - Table view
    - Sidebar to slide

- [] Settings page
    - change the scheduling algorithm
    - upload custom scheduling algorithms
    - provide api keys if needed

- [ ] All cards page
    - [ ] filtering and stuff
    - [ ] review custom set of cards

- [ ] Custom algorithms

- [ ] Dark mode (later on once everything is working)

- [ ] Import/export
    - custom format
    - anki
    - mochi

- [ ] AI basics

## Notes

learning_state:
- new
- learning
- reviewing
- due

schedule_state:
- none
- scheduled
- due
- overdue

management_state:
- active
- buried
- flagged
- archived
