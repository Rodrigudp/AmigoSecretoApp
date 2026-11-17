# ADR-003: Sorteio no servidor por derangement

- **Status:** aceita
- **Data:** 2026-11-17
- **Autor:** Orquestrador + Feature Sorteio

## Contexto
RN02 exige que ninguém tire a si mesmo e que todos tirem e sejam tirados uma única vez. RN03 e RNF04 exigem sigilo.

## Decisão
Embaralhar os participantes com **Fisher–Yates** usando `crypto.getRandomValues` e formar um **ciclo único**
(cada um presenteia o próximo da lista embaralhada, o último presenteia o primeiro). Isso gera sempre uma permutação
sem ponto fixo, em O(n), sem tentativa e erro. Executado só no servidor, dentro de uma transação que grava `draws` e `pairs`.

## Alternativas consideradas
- Sortear e refazer até não haver ponto fixo — funciona, mas tempo não determinístico e difícil de testar.
- Sortear no navegador — viola RNF04.

## Consequências
- Positivas: correto por construção, testável com RNG injetado (função pura `drawPairs(ids, rng)`).
- Negativas: não gera permutações com vários ciclos pequenos; irrelevante para o usuário.
  Restrições do tipo "fulano não tira ciclano" (fora do MVP) exigirão outro algoritmo e um novo ADR.
