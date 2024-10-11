
import pygame
from pygame.locals import *
pygame.init()
screen = pygame.display.set_mode((640, 480))
pygame.key.set_repeat(1)
while True:
    for event in pygame.event.get():
        if event.type == QUIT:
            exit()
        elif event.type == KEYDOWN:
            if event.key == K_w:
                screen.fill((0, 0, 255))
            elif event.key == K_a:
                screen.fill((255, 0, 0))
            elif event.key == K_s:
                screen.fill((0, 255, 0))
            elif event.key == K_d:
                screen.fill((255, 255, 0))
    pygame.display.update()