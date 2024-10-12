# Inicialização do jogo
# Jogo gerado pelo modelo "Mario" CodeLlama:7b-python
# Leonardo Marques de Souza
# leonardo.souza@indt.org.br
# versão alpha 0.1v
# * apenas um quadrado
# * teclas A, W, S, D para movimento
# * move apenas pra esquerda e direita
# * modelo não entendeu o propósito



import pygame
import sys

# Tamanho da tela
TAMANA_TELA = 800
TAMANA_FIM = 50

# Cor do fundo
COR_FUNDO = (255, 0, 0)

# Cor do corredor Mario
COR_MARIO = (255, 165, 0)

class Corredor:
    def __init__(self):
        self.x = TAMANA_TELA // 2

    def desenhar(self, tela):
        pygame.draw.rect(tela, COR_MARIO, (self.x, 0, 20, 20))

def main():
    # Crie a tela
    tela = pygame.display.set_mode((TAMANA_TELA, TAMANA_FIM))
    pygame.display.set_caption("Mario")

    # Inicie o jogo
    corredor = Corredor()
    pontes = [
        {"x": 100, "y": 200},
        {"x": 300, "y": 400},
        {"x": 500, "y": 600}
    ]

    # Função para pular
    def pular(tela):
        corredor.y -= 10

    # Função para desenhar as pontes
    def desenhar_ponte(tela, ponte):
        pygame.draw.rect(tela, (0, 0, 255), (ponte["x"], ponte["y"], 10, 20))

    # Função para verificar se o corredor está acertando uma ponte
    def verifica_acerto_ponte(tela, corredor):
        for ponte in pontes:
            if corredor.x <= ponte["x"] + 10 and corredor.x + 20 >= ponte["x"] - 10 and corredor.y <= ponte["y"] + 20 and corredor.y + 20 >= ponte["y"] - 10:
                return True
        return False

    # Função para desenhar o jogo
    def desenhar_jogo(tela, corredor):
        for ponte in pontes:
            desenhar_ponte(tela, ponte)
        pygame.draw.rect(tela, COR_FUNDO, (0, TAMANA_FIM, TAMANA_TELA, TAMANA_FIM))
        corredor.desenhar(tela)

    # Função para verificar se o jogo está terminado
    def verifica_jogo_terminado():
        for ponte in pontes:
            if corredor.x <= ponte["x"] + 10 and corredor.x + 20 >= ponte["x"] - 10 and corredor.y <= ponte["y"] + 20 and corredor.y + 20 >= ponte["y"] - 10:
                return False
        return True

    # Função para controlar o Mario
    def controlar_mario(tela, corredor):
        if pygame.key.get_pressed()[pygame.K_w]:
            corredor.y -= 5
        if pygame.key.get_pressed()[pygame.K_s]:
            corredor.y += 5
        if pygame.key.get_pressed()[pygame.K_a]:
            corredor.x -= 5
        if pygame.key.get_pressed()[pygame.K_d]:
            corredor.x += 5

    # Inicie o jogo
    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

        # Controle do Mario
        controlar_mario(tela, corredor)

        tela.fill(COR_FUNDO)
        corredor.desenhar(tela)

        if verifica_acerto_ponte(tela, corredor):
            print("Você acertou uma ponte!")
        else:
            print("Você não acertou uma ponte.")

        pygame.display.flip()
        pygame.time.Clock().tick(60)

if __name__ == "__main__":
    main()