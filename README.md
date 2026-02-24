# What is MindMap

MindMap is a Spanish focused web application designed to enhance the Spanish learning experience for students through spaced repetition and specialized content. Unlike traditional language learning platforms that rely on static generalized curricula, MindMap will allow users to enjoy a more personalized learning experience based on the specific curricula provided by our advisor. Users will also have the option to upload content themselves to generate new activities for them to practice. By leveraging large language models this application will be able to generate dynamic activities tailored to user needs based on the material they provide.

# How do I Setup this project?
Before starting with the steps you need to already have a firebse account and be added to the firebase project *MindMapauth*, conctact djm18 to be added if you are going to contribute/collaborate on this project. 

Backend Setup
  1. clone https://github.com/djm18/MindMap.git
  2. 'python -m venv .venv' (this is to create a virtual enviroment)
  3. '.venv\Scripts\activate' (its to run the virtual enviroment)
  4. if it give you an error use this command: 'Set-ExecutionPolicy RemoteSigned -Scope Process' and go to step 4.
  5. if you see: '(venv)PS C:\Git\MindMap>' go to the next step
  6. 'pip install -r requirements.txt' (in the (venv))
  7. 'python install fastapi uvicorn' or 'py install fastapi uvicorn'

     'python install SQLalchemy' or 'py install SQLalchemy'
  8. create a file '.env' and inside the file write (NOTE: you need to create a firebase account and get added to the firebase MindMapauth project so you can complete this step, and no spaces):

     DATABASE_URL= mysql+pymysql://###########(connection string)
     
      FIREBASE_PRIVATE_KEY_PATH=C:\Git\MindMap\mindmap-backend\firebase_key.json
     
	    ENVIROMENT=development
  9. 'cd MindMap/mindmap-backend'
  10. 'uvicorn app.main:app --reload'
  11. if it does not work make sure you are in the mindmap-backend 
  12. when it compiles copy the 'http://###.#.#.#:#####' address (you can paste it somewhere in a notepad)

Frontend Setup:
  1. make a new terminal (activate the .venv)
  2. 'npm install' (NOTE: everything has to be outside the src folder NO EXCEPTIONS)
  3. create a '.env.local' file (WARNING: it has to be outside src folder)
  4. type inside the .env.local
     (NOTE: you need to create a firebase account then get added to the firebase MindMapauth project so you can complete this step and no spaces):

     NEXT_PUBLIC_FIREBASE_API_KEY=

     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=

     NEXT_PUBLIC_FIREBASE_PROJECT_ID=

     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=

     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=

     NEXT_PUBLIC_FIREBASE_APP_ID=

     NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

     NEXT_PUBLIC_API_URL=http://###.#.#.#:#####
  5. go to the MindMapauth firebase project 
  6. go to Build > authentication and see if you see your email 
  7. then check for auth domian go to Authentication -> Settings -> Authorized domains 
  8. make sure the domain exist "localhost" (cannot use the IPaddress need to be dms(domain name system))
  9. once all these match the application will work(hopefully)
  10. 'npm run dev' or 'npm start' or 'npm run build'(build is just to see if it compiles)
     if npm not work use 'Set-ExecutionPolicy RemoteSigned -Scope CurrentUser' for it to work

DATABASE
  1. install sqltools extention 
  2. click new connection
  3. go to the "Server and Port", change to 'Connection String' 
  4. Add the link of Connection String
  5. "TEST CONNECTION" (if its fails go back to step 4)
  6. When 'succefull connection' appear, go click "SAVE CONNECTION"
  7. Congradulation you finish  

here is a video to follow: https://youtu.be/VjON3LbFtLs

# How do I contribute?
TODO
