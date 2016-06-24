# Face Expression Based Emoticon Identification

The Face Expression Based Emoticon Identification (FEBEI) system is an open source extension to the Tracker.js framework which converts a human facial expression to the best matching emoticon. The contribution of this project is to build this robust classifier which can identify facial expression in real time without any reliance on an external server or computation node. An entirely client-side JavaScript implementation has clear privacy benefits as well as the avoidance of any lag inherent in uploading and downloading images. We accomplished this by utilizing several computationally efficient methods. Tracking.js provided a Viola Jones based face detector which we used to pass facial images to our own implementation of an eigenemotion detection system which is trained to distinguish between happy and angry faces.

# How to use

The folder Eigenemotions contains the source code which exists as tracking-extension.js. There is also a sample implementation of the eigenemotions. This priliminary version can detect 2 emotions - angry and happy.

Invoking the tracking extension is simple. For a static image it can be invoked as follows:

				var img = document.getElementById(<image element selector>);
				var tracker = new tracking.ObjectTracker('face');
				tracker.setStepSize(1.7);
				tracking.track('#img', tracker);
				var canvas = document.createElement('canvas');
				var context = canvas.getContext('2d');
				context.drawImage(img, 0, 0 );
				tracking.detect('EigenEmotions', '#img', context, canvas, tracker, {});


The below is the code for invoking tracking extension for face expression recognition on live feed video:

				var video = document.getElementById(<selector for video tag>);
				var canvas = document.getElementById(<selector for canvas tag>);
				var context = canvas.getContext('2d');
				var tracker = new tracking.ObjectTracker('face');
				tracker.setInitialScale(4);
				tracker.setStepSize(2);
				tracker.setEdgesDensity(0.1);
				tracking.detect('EigenEmotions', '#video', context, canvas, tracker, { camera: true });

Both of these are implemented in an example in face_exp.html

The library has to be included in you project with multiple files. The typical set of files you would include are:

				<script src="build/tracking.js"></script>
				<script src="build/data/face-min.js"></script>
				<script src="assets/stats.min.js"></script>
				<script src="numeric.js"></script>
				<script src="svm.js"></script>
				<script src="build/data/svm_model.js"></script>
				<script src="build/data/pca_data.js"></script>
				<script src="build/data/pca_labels.js"></script>
				<script src="build/data/pca_mean.js"></script>
				<script src="build/data/pca_components.js"></script>
				<script src="build/tracking_extension.js"></script>
				<script src="https://code.jquery.com/jquery-2.2.3.min.js"></script>


Any version of jquery can be included. The contents of the file are pretty self explanatory. Most of the JS files contains the raw model exported from the training on python. Singular Vector Decomposition (SVD) is achieved by importing the numeric.js library by Sébastien Loisel from http://www.numericjs.com/. The SVM is obtained from the open sourced library svmjs by Andrej Karpathy from https://github.com/karpathy/svmjs. Tracking.js serves as a backbone for this system and it can be found at https://trackingjs.com/. 

# How to train

The training of this model can seem a bit intimidating but is actually not so. These are the steps involved:

# 1. Changing the dataset

The folder emotions contains the actual images. Just change or add images to that. The subfolders are the classes. Pretty straightforward, no twists here. But it doesn't end there. You need to compress the new dataset into face_expressions.tgz and create new devtest and devtrain pair files. These are of the following format:

			10
			happyfaces S026_006_00000006 S050_006_00000013
			happyfaces S075_006_00000015 S075_006_00000011
			happyfaces S057_006_00000019 S075_006_00000023
			happyfaces S109_006_00000012 S076_006_00000007
			happyfaces S026_006_00000006 angryfaces S042_005_00000019

The first line contains the number of cases and the lines after that are cases. Each line is of format:

			<class> <file1> {<different_class>} <file2>

the PairsDevTest.txt is the test file and PairsDevTrain.txt is the train file. Make sure you give as many training samples with as many combinations as possible.

The last step is that now copy the whole face-rec folder (with the updated dataset and pair files) and place it as it is in your local server. I used the Apache server (MAMP, XAMPP, LAMP whichever u prefer) and just placed it in the htdocs folder. I would recommend the same for all to avoid hassles (You can contact us in any case, we will do the best to help).

# 2. Training the new model

We have added a new model to scikit learn for the dataset. This is the face_expressions.py. This will download the face library that we have put to htdocs, resize and get the right frames for training and classification. This file should be placed in:

				/Library/Python/2.7/site-packages/sklearn/datasets

This is now usable to train. The file you should run to train and test is the face_rec.py in the python-face-rec-library folder. Once you change the dataset, ready the sklearn and run this you will obtain the following things:

1. A PCA model pickle file
2. A SVM pickle file
3. A model.txt file with the training vectors
4. A model_label.txt file with the training labels
5. An example classification result
6. The Eigenface pictures

The first two are for the evaluatory python server inputs and do not need to be touched. The rest 2 are for the JS. The data in the model.txt should replace the data/pca_data.js file and the model_label.txt should replace the data/pca_labels.js.

Congrats!! You have completed the first phase of training the new model.

The next phase is fairly simple. Just visit the svm_train.html in your server with all the files present. It will train the new pca data and print the new numeric model which you should copy and replace the existing model in data/svm_model.js.

And hence you have trained a new model. Good job!!

# 3. Evaluating the new model

One can evaluate the model using the python flask server based classification. The code for this is also inherently present. The python server is face_server.py just do:

				python face_server.py

and the server should with the newest model loaded.

# Experiment with freedom

We are a bunch of open source enthusiasts crazy about AI and vision. This is an ongoing project and the modules that we have made to work are powerful and promising. Hence we would like you to change the code to your needs and weave innovative uses out of it in your own way....no frills.