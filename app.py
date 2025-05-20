from flask import Flask, request, render_template

app = Flask(__name__)

# --- Definición de los Filtros ---

def filtro_mayusculas(texto):
    """Convierte el texto a mayúsculas."""
    print("Aplicando filtro: Mayúsculas")
    return texto.upper()

def filtro_eliminar_vocales(texto):
    """Elimina las vocales del texto."""
    print("Aplicando filtro: Eliminar Vocales")
    vocales = "AEIOUÁÉÍÓÚaeiouáéíóú"
    resultado = ''.join(c for c in texto if c not in vocales)
    return resultado

def filtro_contar_palabras(texto):
    """Cuenta las palabras y añade el conteo al final."""
    print("Aplicando filtro: Contar Palabras")
    num_palabras = len(texto.split())
    return f"{texto} (Número de palabras: {num_palabras})"

# --- Definición de la Tubería (Pipeline) ---

# Lista de filtros a aplicar en orden
pipeline_filtros = [
    filtro_mayusculas,
    filtro_eliminar_vocales,
    filtro_contar_palabras
]

def ejecutar_pipeline(texto_inicial):
    """Ejecuta el texto a través de la secuencia de filtros."""
    texto_actual = texto_inicial
    resultados_intermedios = {'Inicial': texto_inicial}
    
    for i, filtro in enumerate(pipeline_filtros):
        texto_actual = filtro(texto_actual)
        # Guardamos el resultado intermedio con un nombre descriptivo
        nombre_filtro = filtro.__name__.replace('filtro_', '').replace('_', ' ').title()
        resultados_intermedios[f'Paso {i+1}: {nombre_filtro}'] = texto_actual
        
    return texto_actual, resultados_intermedios

# --- Rutas de Flask ---

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        texto_entrada = request.form['texto']
        if texto_entrada:
            texto_final, resultados = ejecutar_pipeline(texto_entrada)
            # Pasamos los resultados directamente, usaremos |tojson en la plantilla
            return render_template('index.html', 
                                   resultados=resultados, 
                                   texto_final=texto_final, 
                                   texto_inicial=texto_entrada)
        else:
             return render_template('index.html', error="Por favor, ingresa algún texto.")
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)