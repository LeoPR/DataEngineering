# Inicialização do jogo
# Jogo gerado pelo modelo "Mario" Llama3.2:3b
# Leonardo Marques de Souza
# leonardo.souza@indt.org.br
# versão alpha 0.1v
# * tela ascii
# * sem limites de movimento
# * teclas A, W, S, D para movimento

posx = 5
posy = 2
velocidade_x = 0
velocidade_y = 0

while True:
  # Desenho da tela
  for i in range(10):
    linha = ""
    for j in range(10):
      if posy - i == 1 and j == posx:
        linha += "M "
      else:
        linha += ". "
    print(linha)
  print()

  # Saída de teclas
  tecla = input("Digite uma tecla (A, W, S, D): ")

  # Movimento do personagem
  if tecla.upper() == 'A':
    velocidade_x = -1
  elif tecla.upper() == 'D':
    velocidade_x = 1
  elif tecla.upper() == 'W' and posy > 0:
    velocidade_y = -1
  elif tecla.upper() == 'S' and posy < 8:
    velocidade_y = 1

  # Atualização da posição do personagem
  if velocidade_x != 0:
    posx += velocidade_x
  if velocidade_y != 0:
    posy += velocidade_y

  # Verificação de colisão com o chão
  if posy < 1 or posy > 8:
    velocidade_y = 0