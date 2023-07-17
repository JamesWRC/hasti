FROM python:3.7
EXPOSE 443
RUN apt -y update

# copy whole installation (minus dockerignore)
COPY ./codebase /codebase

# install additional dependencies
RUN pip install -r /codebase/requirements.txt

# set workdir to have subscripts in scope
WORKDIR ./codebase
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "443", "--reload"]