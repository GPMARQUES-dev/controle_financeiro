# Adicionamos 'request' para receber os dados do frontend
from flask import Flask, jsonify, request, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS # <-- ADICIONE ESTA LINHA

app = Flask(__name__)
CORS(app) # <-- E ADICIONE ESTA LINHA

# --- CONFIGURAÇÃO DO BANCO DE DADOS ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)

# --- MODELO DA TABELA ---
class Transacao(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tipo = db.Column(db.String(10), nullable=False)
    valor = db.Column(db.Float, nullable=False)
    data = db.Column(db.String(10), nullable=False)
    categoria = db.Column(db.String(100), nullable=False)
    local_origem = db.Column(db.String(150))

    # --- MODELO DA TABELA ---
class Transacao(db.Model):
    # ... (as definições das colunas continuam as mesmas) ...

    # Substitua a função to_dict por esta:
    def to_dict(self):
        return {
            'id': self.id,
            'type': self.tipo,       # Traduz de 'tipo' para 'type'
            'value': self.valor,     # Traduz de 'valor' para 'value'
            'date': self.data,       # Traduz de 'data' para 'date'
            'category': self.categoria, # Traduz de 'categoria' para 'category'
            'location': self.local_origem # Traduz de 'local_origem' para 'location'
        }

# --- ROTA PARA LISTAR TRANSAÇÕES (GET) ---
@app.route('/api/transacoes')
def get_transacoes():
    transacoes = Transacao.query.all()
    return jsonify([t.to_dict() for t in transacoes])

# --- ROTA PARA ADICIONAR NOVA TRANSAÇÃO (POST) ---
@app.route('/api/transacoes', methods=['POST'])
def add_transacao():
    # Pega os dados JSON enviados pelo frontend
    dados = request.get_json()

# --- ROTA PARA A PÁGINA PRINCIPAL (/) ---
@app.route('/')
def pagina_inicial():
    # Esta função procura o arquivo 'index.html' na pasta 'templates' e o exibe.
    return render_template('index.html')

    # Cria um novo objeto Transacao com os dados recebidos
    nova_transacao = Transacao(
        tipo=dados['tipo'],
        valor=dados['valor'],
        data=dados['data'],
        categoria=dados['categoria'],
        local_origem=dados.get('local_origem') # .get() é mais seguro se o campo for opcional
    )

    # Adiciona a nova transação ao banco de dados
    db.session.add(nova_transacao)
    db.session.commit()

    # Retorna uma resposta de sucesso com os dados da transação criada
    return jsonify(nova_transacao.to_dict()), 201
