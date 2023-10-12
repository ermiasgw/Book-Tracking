FROM python:3.11.6-alpine3.18

WORKDIR /backend

COPY ./requirements.txt .

RUN pip install --no-cache-dir --upgrade -r requirements.txt
 
COPY . /backend

EXPOSE 8000

RUN chmod +x ./entrypoint.sh

ENTRYPOINT [ "./entrypoint.sh" ]


