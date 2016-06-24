from __future__ import print_function
from flask import Flask
from flask import request

from time import time
import logging
import matplotlib.pyplot as plt
import numpy as np
import pickle
from sklearn.externals import joblib
import json
import pprint
import svd

from sklearn.cross_validation import train_test_split
from sklearn.datasets import face_expressions
from sklearn.grid_search import GridSearchCV
from sklearn.metrics import classification_report
from sklearn.metrics import confusion_matrix
from sklearn.decomposition import RandomizedPCA
from sklearn.svm import SVC
app = Flask(__name__)

pca = joblib.load('pca_model/pca_file.pkl')
clf = joblib.load('svm_model/svm_file.pkl')

from datetime import timedelta
from flask import make_response, request, current_app
from functools import update_wrapper


def crossdomain(origin=None, methods=None, headers=None,
                max_age=21600, attach_to_all=True,
                automatic_options=True):
    if methods is not None:
        methods = ', '.join(sorted(x.upper() for x in methods))
    if headers is not None and not isinstance(headers, basestring):
        headers = ', '.join(x.upper() for x in headers)
    if not isinstance(origin, basestring):
        origin = ', '.join(origin)
    if isinstance(max_age, timedelta):
        max_age = max_age.total_seconds()

    def get_methods():
        if methods is not None:
            return methods

        options_resp = current_app.make_default_options_response()
        return options_resp.headers['allow']

    def decorator(f):
        def wrapped_function(*args, **kwargs):
            if automatic_options and request.method == 'OPTIONS':
                resp = current_app.make_default_options_response()
            else:
                resp = make_response(f(*args, **kwargs))
            if not attach_to_all and request.method != 'OPTIONS':
                return resp

            h = resp.headers
            h['Access-Control-Allow-Origin'] = origin
            h['Access-Control-Allow-Methods'] = get_methods()
            h['Access-Control-Max-Age'] = str(max_age)
            h['Access-Control-Allow-Credentials'] = 'true'
            h['Access-Control-Allow-Headers'] = \
                "Origin, X-Requested-With, Content-Type, Accept, Authorization"
            if headers is not None:
                h['Access-Control-Allow-Headers'] = headers
            return resp

        f.provide_automatic_options = False
        return update_wrapper(wrapped_function, f)
    return decorator

@app.route("/face/", methods=['POST', 'OPTIONS'])
@crossdomain(origin='*')
def identify():
	result  = [0]
	box_data_u = request.form.getlist('box_data_new[]')
	if len(box_data_u) > 0:
		box_data = [float(x) for x in box_data_u]
        box_data = np.array([box_data], dtype=np.float32)
        pprint.pprint(box_data);
        x_test = pca.transform(box_data)
        result = clf.predict(x_test)
        print("The result is: ")
        print(result)
	return json.dumps(result[0].item());

if __name__ == "__main__":
    app.run(debug=True)