---
layout: home
permalink: index.html

# Please update this with your repository name and project title
repository-name: e23-co2060-MaathaCare
title: MaathaCare
---

[comment]: # "This is the standard layout for the project, but you can clean this and use your own template, and add more information required for your own project"

<!-- Once you fill the index.json file inside /docs/data, please make sure the syntax is correct. (You can use this tool to identify syntax errors)

Please include the "correct" email address of your supervisors. (You can find them from https://people.ce.pdn.ac.lk/ )

Please include an appropriate cover page image ( cover_page.jpg ) and a thumbnail image ( thumbnail.jpg ) in the same folder as the index.json (i.e., /docs/data ). The cover page image must be cropped to 940×352 and the thumbnail image must be cropped to 640×360 . Use https://croppola.com/ for cropping and https://squoosh.app/ to reduce the file size.

If your followed all the given instructions correctly, your repository will be automatically added to the department's project web site (Update daily)

A HTML template integrated with the given GitHub repository templates, based on github.com/cepdnaclk/eYY-project-theme . If you like to remove this default theme and make your own web page, you can remove the file, docs/_config.yml and create the site using HTML. -->

# MaathaCare

---

## Team
- E/23/211, A.M.G.M.Madubhashinie, [e23211@eng.pdn.ac.lk](mailto:e23211@eng.pdn.ac.lk)
- E/23/244, M.T.C.Newanma, [e23244@eng.pdn.ac.lk](mailto:e23244@eng.pdn.ac.lk)
- E/23/360, K.K.S.Semmindi, [e23360@eng.pdn.ac.lk](mailto:e23360@eng.pdn.ac.lk)
- E/23/427, A.S.Weerasinghe, [e23427@eng.pdn.ac.lk](mailto:e23427@eng.pdn.ac.lk)


<!-- Image (photo/drawing of the final hardware) should be here -->

<!-- This is a sample image, to show how to add images to your page. To learn more options, please refer [this](https://projects.ce.pdn.ac.lk/docs/faq/how-to-add-an-image/) -->

<!-- ![Sample Image](./images/sample.png) -->

#### Table of Contents
1. [Introduction](#introduction)
2. [Solution Architecture](#solution-architecture )
3. [Software Designs](#hardware-and-software-designs)
4. [Testing](#testing)
5. [Conclusion](#conclusion)
6. [Links](#links)

## Introduction

MaathaCare is a smart digital healthcare ecosystem designed to modernize maternal support services within Sri Lanka’s public health sector. While the current healthcare framework is fundamentally robust, it is heavily reliant on manual, paper-based record-keeping. MaathaCare bridges this technological gap by digitizing the tracking of clinic schedules, supplement adherence, and high-risk pregnancy indicators, ensuring no mother is left behind due to administrative inefficiencies.


## Solution Architecture

MaathaCare follows a modern **three-tier architecture** to ensure scalability and security. The system connects pregnant mothers and healthcare professionals (midwives/doctors) through a centralized cloud-based backend.

### Key Components:
* **Frontend:** A responsive web application built using [React.js / Next.js] for healthcare workers and a mobile-friendly interface for mothers.
* **Backend API:** A RESTful API developed with [Node.js / Python Flask] to handle business logic, authentication, and data processing.
* **Database:** A [PostgreSQL] database stores encrypted patient records, clinic schedules, and medical history.
* **Cloud Hosting:** The system is deployed on [GitHub Pages / AWS / Render], ensuring high availability.

## Software Designs

Detailed designs with many sub-sections

## Testing

Testing done on software : detailed + summarized results

## Conclusion

MaathaCare successfully digitizes the maternal healthcare journey in Sri Lanka, reducing the risk of missed clinics and improving the tracking of high-risk pregnancies. By replacing manual paperwork with a smart digital ecosystem, we provide healthcare workers with actionable insights to save lives.

### Future Developments
* **AI Integration:** Predicting pregnancy complications using machine learning.
* **Multi-language Support:** Adding Sinhala and Tamil voice-guided instructions for better inclusivity.
* **Offline Mode:** Allowing midwives to sync data in rural areas with poor connectivity.
  
## Links

- [Project Repository](https://github.com/cepdnaclk/{{ page.repository-name }}){:target="_blank"}
- [Project Page](https://cepdnaclk.github.io/{{ page.repository-name}}){:target="_blank"}
- [Department of Computer Engineering](http://www.ce.pdn.ac.lk/)
- [University of Peradeniya](https://eng.pdn.ac.lk/)

[//]: # (Please refer this to learn more about Markdown syntax)
[//]: # (https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)
