# Technical Lead Test

## Objective

- Understand the project brief and produce the required deliverables.
- Assessment will be based on your comprehension of the requirements and the quality of the deliverables.
- Spend up to 4 hours on it.

## Project Brief

- Over all project scope is a website and a mobile app
- Phase 1 is a responsive website, Phase 2 is a mobile that is able to leverage the base technology stack
- Audiences in 10 different countries
- Multilingual support
- Lead capture
  - Lead data will be sent to different systems depending on the type of lead and the country of origin, this includes Email and 3rd Party APIs
  - Leads need to be stored in case of delivery failure, storage needs to be in compliance with local data privacy laws
- CMS
- Live data feed from 3rd Party System
- Web experience needs to meet basic standards:
  - WCAG2.2AA Standards
  - Google Lighthouse Accessibility/SEO/Performance Metrics
- Web Experience needs to support structured schema data and social meta data
- Anti spam and security controls
- Mobile Experience needs to leverage device and OS accessibility features
- System needs to collect log and diagnostic data and metrics and support a sensible alerting strategy

## Deliverables

### 1. Solution

1. Produce a high level architecture, this should include:
   - A basic diagram of of the system components
   - Write a few paragraphs explaining the architecture and technologies you would use to build the solution
2. Provide a simple explanation of solution for a less technical audience such as project managers and the client
3. Identify any risks or initial threat modelling related to the solution

### 2. Delivery Estimate / Timeline

1. Produce a scope and high level estimate for development of Phase 1
2. Produce a time-line for delivery
3. State any assumptions

### 3. Project Setup

1. Create a new project using one of the technologies from your proposal.
2. Set up a basic project structure with any build tools, linters, and testing frameworks you would use.
3. Create one lead capture form and a form handler.
   - Fields:
     - first name
     - last name
     - email
     - accept terms
     - mobile number
     - marketing referral data
     - notes
   - Handler:
     - sanitise data
     - save data somewhere appropriate
4. Provide at minimum a `README.md` file with instructions on how to set up and run the project.

## Submission Instructions

- All submission artefacts are to be supplied by providing Catch with access to a single github repository
- **1. Solution** and **2. Delivery Estimate** are be supplied as markdown files in a folder named `docs` in the root of your repository, you may ship other artifacts such as images if required.
  An example directory structure is shown below:

```
|-- README.md
|-- docs
|   |-- _assets
|   |   |-- hla.png
|   |   `-- gant.png
|   |-- 1-solution.md
|   `-- 2-deliery-estimate-and-timeline.md
`-- ...project_files
```

- Submit your project by sending an email to [tech-tests@catchdesign.co.nz](mailto:tech-tests@catchdesign.co.nz) containing a link to your GitHub project.
  If your repository is private, let us know and we will provide you with users to grant accesss to.
