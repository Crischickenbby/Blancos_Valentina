import psycopg2
import os
from dotenv import load_dotenv #esto es para cargar las variables de entorno desde un archivo .env

# Cargar variables de entorno
load_dotenv()

# Configuración de la base de datos
DB_HOST = os.getenv('DB_HOST') #os es para Windows getenv es para Linux pero estoy utilizando Windows y funciona
DB_NAME = os.getenv('DB_NAME')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')

# Clave secreta para Flask
SECRET_KEY = os.getenv('SECRET_KEY', 'clave-por-defecto') #esto sirve para que no se vea la clave en el código de la aplicación y se mantenga segura osea en palabras mas sencillas es para que no se vea la clave en el código de la aplicación y se mantenga segura
#con codigo de la aplicación me refiero a que es el código que se ejecuta en el servidor

# Función para obtener una conexión a la base de datos
def get_db_connection():
    return psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )
