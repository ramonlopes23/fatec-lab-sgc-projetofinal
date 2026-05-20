# Processo de Exumação - Cenários de Validação e Exceção

## Regra principal

Para gerar um processo de exumação, os campos `motivo`, `destino` e `coveiro` são obrigatórios. O campo `observações` é opcional.

## Cenários documentados

1. **Cadastro válido de exumação**
   - Dado um sepultamento válido e sem exumação pendente.
   - Quando motivo, destino e coveiro forem preenchidos.
   - Então o processo deve ser criado com status `pendente` e aguardar confirmação.

2. **Motivo não preenchido**
   - Quando o usuário tentar confirmar sem informar o motivo.
   - Então o sistema deve bloquear o envio e exibir a mensagem `Motivo é obrigatório.`.

3. **Destino não preenchido**
   - Quando o usuário tentar confirmar sem selecionar o destino.
   - Então o sistema deve bloquear o envio e exibir a mensagem `Destino é obrigatório.`.

4. **Coveiro não preenchido**
   - Quando o usuário tentar confirmar sem informar o coveiro.
   - Então o sistema deve bloquear o envio e exibir a mensagem `Coveiro é obrigatório.`.

5. **Campos obrigatórios preenchidos apenas com espaços**
   - Quando motivo, destino ou coveiro contiver somente espaços em branco.
   - Então o valor deve ser tratado como vazio e o envio deve ser bloqueado.

6. **Observações não preenchidas**
   - Quando observações estiver vazio e os campos obrigatórios estiverem válidos.
   - Então o sistema deve permitir o cadastro normalmente.

7. **Sepultamento inválido ou ausente**
   - Quando o formulário não possuir identificação de sepultamento.
   - Então o sistema deve bloquear o envio e informar que os dados são inválidos.

8. **Exumação pendente já existente**
   - Quando já existir uma exumação pendente para o mesmo sepultamento.
   - Então o sistema deve impedir a abertura/envio de novo processo e informar a duplicidade.

9. **Erro de validação retornado pelo backend**
   - Quando a API retornar `400`.
   - Então o sistema deve orientar o usuário a revisar os dados informados.

10. **Usuário sem permissão**
    - Quando a API retornar `401` ou `403`.
    - Então o sistema deve informar que o usuário não tem permissão para cadastrar exumação.

11. **Sepultamento ou destino não encontrado**
    - Quando a API retornar `404`.
    - Então o sistema deve informar que o sepultamento ou destino não foi encontrado.

12. **Conflito de processo**
    - Quando a API retornar `409`.
    - Então o sistema deve informar que já existe uma exumação pendente para o registro.

13. **Falha inesperada do servidor**
    - Quando a API retornar erro `5xx`.
    - Então o sistema deve informar indisponibilidade temporária e permitir nova tentativa.

14. **Resposta inválida da API**
    - Quando a API responder sem objeto de exumação criado.
    - Então o sistema deve tratar como falha e não marcar o processo como criado localmente.

15. **Duplo clique no botão confirmar**
    - Quando o usuário clicar mais de uma vez durante o envio.
    - Então o botão deve ficar desabilitado enquanto a requisição estiver em andamento.

16. **Correção de campo inválido**
    - Quando o usuário editar um campo obrigatório que estava inválido.
    - Então a mensagem daquele campo deve ser removida durante a correção.
