#!/bin/bash

#FERRAMENTAS VISUAIS

centralizar() {
    texto="$1"
    largura_terminal=$(tput cols)
    espacos=$(( (largura_terminal - ${#texto}) / 2 ))
    printf "%*s%s\n" "$espacos" "" "$texto"
}

roxo="\033[35m"
azul="\033[34m"
branco="\e[1;37m"   # Branco brilhante
reset="\033[0m"
banner(){
  clear
  clear
    echo -e "${roxo}"
centralizar "███████╗███╗   ██╗ ██████╗██╗  ██╗ █████╗     █████╗ ██╗"
centralizar "██╔════╝████╗  ██║██╔════╝██║  ██║██╔══██╗   ██╔══██╗██║"
centralizar "█████╗  ██╔██╗ ██║██║     ███████║███████║   ███████║██║"
centralizar "██╔══╝  ██║╚██╗██║██║     ██╔══██║██╔══██║   ██╔══██║██║"
centralizar "███████╗██║ ╚████║╚██████╗██║  ██║██║  ██║██╗██║  ██║██║"
centralizar "╚══════╝╚═╝  ╚═══╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═╝"
    echo -e "${reset}"
    echo -e "${azul}"
    centralizar "Sistema de Deploy Automatizado"
    echo -e "${reset}"
    echo ""
}


#MENSAGENS DE PASSOS

msg_traefik_portainer(){
  clear
    echo -e "${roxo}"
centralizar "████████╗██████╗  █████╗ ███████╗███████╗██╗██╗  ██╗"               
centralizar "╚══██╔══╝██╔══██╗██╔══██╗██╔════╝██╔════╝██║██║ ██╔╝"                 
centralizar "   ██║   ██████╔╝███████║█████╗  █████╗  ██║█████╔╝"        
centralizar "   ██║   ██╔══██╗██╔══██║██╔══╝  ██╔══╝  ██║██╔═██╗"        
centralizar "   ██║   ██║  ██║██║  ██║███████╗██║     ██║██║  ██╗"               
centralizar "   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝"                                                                                
centralizar "██████╗  ██████╗ ██████╗ ████████╗ █████╗ ██╗███╗   ██╗███████╗██████╗"
centralizar "██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝██╔══██╗██║████╗  ██║██╔════╝██╔══██╗"
centralizar "██████╔╝██║   ██║██████╔╝   ██║   ███████║██║██╔██╗ ██║█████╗  ██████╔╝"
centralizar "██╔═══╝ ██║   ██║██╔══██╗   ██║   ██╔══██║██║██║╚██╗██║██╔══╝  ██╔══██╗"
centralizar "██║     ╚██████╔╝██║  ██║   ██║   ██║  ██║██║██║ ╚████║███████╗██║  ██║"
centralizar "╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝"                                                                                
    echo -e "${reset}"
    echo ""

}

msg_evolution_api(){
  clear
    echo -e "${roxo}"
centralizar "███████╗██╗   ██╗ ██████╗ ██╗     ██╗   ██╗████████╗██╗ ██████╗ ███╗   ██╗"       
centralizar "██╔════╝██║   ██║██╔═══██╗██║     ██║   ██║╚══██╔══╝██║██╔═══██╗████╗  ██║"      
centralizar "█████╗  ██║   ██║██║   ██║██║     ██║   ██║   ██║   ██║██║   ██║██╔██╗ ██║"       
centralizar "██╔══╝  ╚██╗ ██╔╝██║   ██║██║     ██║   ██║   ██║   ██║██║   ██║██║╚██╗██║"      
centralizar "███████╗ ╚████╔╝ ╚██████╔╝███████╗╚██████╔╝   ██║   ██║╚██████╔╝██║ ╚████║"      
centralizar "╚══════╝  ╚═══╝   ╚═════╝ ╚══════╝ ╚═════╝    ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝"      
    echo -e "${reset}"
    echo ""
}

msg_n8n(){
  clear
      echo -e "${roxo}"
centralizar "███╗   ██╗ █████╗ ███╗   ██╗"
centralizar "████╗  ██║██╔══██╗████╗  ██║"
centralizar "██╔██╗ ██║╚█████╔╝██╔██╗ ██║"
centralizar "██║╚██╗██║██╔══██╗██║╚██╗██║"
centralizar "██║ ╚████║╚█████╔╝██║ ╚████║"
centralizar "╚═╝  ╚═══╝ ╚════╝ ╚═╝  ╚═══╝"
      echo -e "${reset}"
      echo ""
}

msg_chatwoot(){
  clear
      echo -e "${roxo}"
centralizar " ██████╗██╗  ██╗ █████╗ ████████╗██╗    ██╗ ██████╗  ██████╗ ████████╗"
centralizar "██╔════╝██║  ██║██╔══██╗╚══██╔══╝██║    ██║██╔═══██╗██╔═══██╗╚══██╔══╝"
centralizar "██║     ███████║███████║   ██║   ██║ █╗ ██║██║   ██║██║   ██║   ██║"  
centralizar "██║     ██╔══██║██╔══██║   ██║   ██║███╗██║██║   ██║██║   ██║   ██║"   
centralizar "╚██████╗██║  ██║██║  ██║   ██║   ╚███╔███╔╝╚██████╔╝╚██████╔╝   ██║"   
centralizar " ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝    ╚══╝╚══╝  ╚═════╝  ╚═════╝    ╚═╝"   
      echo -e "${reset}"
      echo ""
}



msg_resumo_informacoes(){
  clear
    echo -e "${roxo}"
centralizar "██████╗ ███████╗███████╗██╗   ██╗███╗   ███╗ ██████╗"
centralizar "██╔══██╗██╔════╝██╔════╝██║   ██║████╗ ████║██╔═══██╗"
centralizar "██████╔╝█████╗  ███████╗██║   ██║██╔████╔██║██║   ██║"
centralizar "██╔══██╗██╔══╝  ╚════██║██║   ██║██║╚██╔╝██║██║   ██║"
centralizar "██║  ██║███████╗███████║╚██████╔╝██║ ╚═╝ ██║╚██████╔╝"
centralizar "╚═╝  ╚═╝╚══════╝╚══════╝ ╚═════╝ ╚═╝     ╚═╝ ╚═════╝" 
    echo -e "${reset}"
    echo -e "${azul}"
    centralizar "Resumo da Configuração"
    echo -e "${reset}"
    echo ""
}

msg_status(){
   clear
    echo -e "${roxo}"
centralizar "███████╗████████╗ █████╗ ████████╗██╗   ██╗███████╗"
centralizar "██╔════╝╚══██╔══╝██╔══██╗╚══██╔══╝██║   ██║██╔════╝"
centralizar "███████╗   ██║   ███████║   ██║   ██║   ██║███████╗"
centralizar "╚════██║   ██║   ██╔══██║   ██║   ██║   ██║╚════██║"
centralizar "███████║   ██║   ██║  ██║   ██║   ╚██████╔╝███████║"
centralizar "╚══════╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚══════╝"
    echo -e "${reset}"
    echo ""
}


msg_retorno_menu(){
  echo -e "\e[33mAVISO: GUARDE TODAS AS INFORMAÇÕES ACIMA NO SEU BLOCO DE NOTAS!\e[0m"
  echo
  echo -e "\e[36m📱 Nos siga no Instagram: \e[1m@encha_ai\e[0m \e[36mpara mais dicas, atualizações e novidades!\e[0m"
  echo
  echo "Aperte ENTER para retornar ao menu de ferramentas"
  read

  sleep 2
}
  
  




#TOOLS GERAIS

validar_senha() { 
    senha=$1
    tamanho_minimo=$2
    tem_erro=0
    mensagem_erro=""

    # Verifica comprimento mínimo
    if [ ${#senha} -lt $tamanho_minimo ]; then
        mensagem_erro+="\n- Por segurança, sua senha precisa ter no mínimo $tamanho_minimo caracteres."
        tem_erro=1
    fi

    # Verifica letra maiúscula
    if ! [[ $senha =~ [A-Z] ]]; then
        mensagem_erro+="\n- Falta pelo menos uma letra maiúscula"
        tem_erro=1
    fi

    # Verifica letra minúscula
    if ! [[ $senha =~ [a-z] ]]; then
        mensagem_erro+="\n- Sua senha precisa de mais força — inclua ao menos uma letra maiúscula."
        tem_erro=1
    fi

    # Verifica número
    if ! [[ $senha =~ [0-9] ]]; then
        mensagem_erro+="\n- Quase lá! Inclua um número para validar sua senha."
        tem_erro=1
    fi

    # Verifica caracteres especiais permitidos
    if ! [[ $senha =~ [@_] ]]; then
        mensagem_erro+="\n- Para avançar, insira pelo menos um caractere especial (@ ou _)."
        tem_erro=1
    fi

    # Verifica caracteres não permitidos
    if [[ $senha =~ [^A-Za-z0-9@_] ]]; then
        mensagem_erro+="\n- Caracteres inválidos detectados. Utilize somente @ ou _."
        tem_erro=1
    fi

    # Se houver erro, mostra as mensagens
    if [ $tem_erro -eq 1 ]; then
        echo -e "Sua senha não atende aos requisitos. Veja o que precisa ajustar: $mensagem_erro"
        return 1
    fi

    return 0
}

wait_stack() {
    echo "Espere alguns instantes. Mas atenção: se demorar mais de 5 minutos, é melhor cancelar e tentar de novo."
    declare -A services_status

    # Inicializa o status de todos os serviços como "pendente"
    for service in "$@"; do
        services_status["$service"]="pendente"
    done

    while true; do
        all_active=true

        for service in "${!services_status[@]}"; do
            if docker service ls --filter "name=$service" | grep -q "1/1"; then
                if [ "${services_status["$service"]}" != "ativo" ]; then
                    echo -e "🟢 Status: \e[32m$service\e[0m online com sucesso."
                    services_status["$service"]="ativo"
                fi
            else
                if [ "${services_status["$service"]}" != "pendente" ]; then
                    services_status["$service"]="pendente"
                fi
                all_active=false
            fi
        done

        if $all_active; then
            sleep 1
            break
        fi
        sleep 30
        echo ""
    done
}

wait_30_sec(){
    sleep 30
}

dados() {
    local dados_vps="/root/dados_vps/dados_vps"

    if [ ! -f "$dados_vps" ]; then
        echo -e "\e[31m[ERRO]\e[0m Arquivo de dados não encontrado em: $dados_vps"
        exit 1
    fi

    nome_servidor=$(grep "Nome do Servidor:" "$dados_vps" | awk -F': ' '{print $2}')
    nome_rede_interna=$(grep "Rede interna:" "$dados_vps" | awk -F': ' '{print $2}')
}



verificar_stack() {
    clear
    local nome_stack="$1"

    if docker stack ls --format "{{.Name}}" | grep -q "^${nome_stack}$"; then
        echo -e "A stack '\e[33m${nome_stack}\e[0m' já está instalada."
        echo -e "Se quiser refazer a instalação, remova a stack \e[33m${nome_stack}\e[0m do seu Portainer e tente novamente."
        echo -e ""
        echo -e "Retornando ao menu principal em 10 segundos..."
        sleep 10

        clear 

        return 0
    else
        return 1
    fi
}

verificar_docker_e_portainer_traefik() {
    ## Verifica se o Docker está instalado
    if ! command -v docker &> /dev/null; then
        clear
        echo -e "\e[33m[Atenção]\e[0m Você ainda não instalou o componente \e[32m[1] Traefik e Portainer\e[0m."
        echo -e "É obrigatório instalar essa opção antes de continuar com esta aplicação."
        echo -e "\n\e[31m✖ Por favor, realize a instalação antes de prosseguir.\e[0m"
        echo -e "\nVoltando ao menu principal em \e[36m5 segundos...\e[0m"
        sleep 5
        
        return 1
    fi

    ## Verifica se o Portainer está instalado
    if ! docker ps -a --format "{{.Names}}" | grep -q "portainer"; then
        clear
        echo -e "\e[33m[Atenção]\e[0m Você ainda não instalou o componente \e[32m[1] Traefik e Portainer\e[0m."
        echo -e "É obrigatório instalar essa opção antes de continuar com esta aplicação."
        echo -e "\n\e[31m✖ Por favor, realize a instalação antes de prosseguir.\e[0m"
        echo -e "\nVoltando ao menu principal em \e[36m5 segundos...\e[0m"
        sleep 5


        return 1
    fi

    ## Verificar se o Traefik está instalado
    if ! docker ps -a --format "{{.Names}}" | grep -q "traefik"; then
        clear
        echo -e "\e[33m[Atenção]\e[0m Você ainda não instalou o componente \e[32m[1] Traefik e Portainer\e[0m."
        echo -e "É obrigatório instalar essa opção antes de continuar com esta aplicação."
        echo -e "\n\e[31m✖ Por favor, realize a instalação antes de prosseguir.\e[0m"
        echo -e "\nVoltando ao menu principal em \e[36m5 segundos...\e[0m"
        sleep 5


        return 1
    fi

    return 0
}

verificar_arquivo() {
    sudo apt install jq -y > /dev/null 2>&1
    if [ ! -f "/root/dados_vps/dados_portainer" ]; then
        nome_credenciais
        criar_arquivo
    else
        verificar_campos
    fi
}

esconder_senha() {
  local senha="$1"
  local tamanho=${#senha}

  if (( tamanho > 55 )); then
    SENHAOCULTA=$(printf '%*s' 55 '' | tr ' ' '*')
  else
    SENHAOCULTA=$(printf '%*s' "$tamanho" '' | tr ' ' '*')
  fi
}

stack_editavel(){

    ## Instalar jq
    sudo apt install jq -y > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "2/10 - [ OK ] - Instalando JQ Método 1/2"
    else
        echo "2/10 - [ OFF ] - Erro ao instalar JQ Método 1/2"
    fi

    sudo apt-get install -y jq > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "3/10 - [ OK ] - Instalando JQ Método 2/2"
    else
        echo "3/10 - [ OFF ] - Erro ao instalar JQ Método 2/2"
    fi

    ## Definindo o diretório do arquivo dados_portainer
    arquivo="/root/dados_vps/dados_portainer"

    ## Verifica se o arquivo existe
    if [ ! -f "$arquivo" ]; then
        echo "Arquivo não encontrado: $arquivo"
        sleep 2

        ## Cria o arquivo caso não exista
        criar_arquivo
    fi

    ## Remove o https:// caso existir
    sed -i 's/Dominio do portainer: https:\/\/\(.*\)/Dominio do portainer: \1/' "$arquivo"

    ## Pega o usuario do portainer
    USUARIO=$(grep "Usuario: " /root/dados_vps/dados_portainer | awk -F "Usuario: " '{print $2}')
    if [ $? -eq 0 ]; then
        echo -e "4/10 - [ OK ] - Pegando usuario do portainer: $bege$USUARIO$reset"
    else
        echo "4/10 - [ OFF ] - Erro ao pegar usuario do portainer"
    fi


    ## Pega a senha do portainer
    SENHA=$(grep "Senha: " /root/dados_vps/dados_portainer | awk -F "Senha: " '{print $2}')
    esconder_senha "$SENHA"
    if [ $? -eq 0 ]; then
        echo -e "5/10 - [ OK ] - Pegando a senha do portainer: $bege$SENHAOCULTA$reset"
    else
        echo "5/10 - [ OFF ] - Erro ao pegar senha do portainer"
    fi

    ## Pega a URL do portainer
    PORTAINER_URL=$(grep "Dominio do portainer: " /root/dados_vps/dados_portainer | awk -F "Dominio do portainer: " '{print $2}')
    if [ $? -eq 0 ]; then
        echo -e "6/10 - [ OK ] - Pegando dominio do Portainer: $bege$PORTAINER_URL$reset"
    else
        echo "6/10 - [ OFF ] - Erro ao pegar dominio do Portainer"
    fi

    ## Usa o token do portainer
    #TOKEN=$(grep "Token: " /root/dados_vps/dados_portainer | awk -F "Token: " '{print $2}')
    
    ## Pega um token do portainer
    #TOKEN=$(curl -k -X POST -H "Content-Type: application/json" -d "{\"username\":\"$USUARIO\",\"password\":\"$SENHA\"}" https://$PORTAINER_URL/api/auth | jq -r .jwt)

    TOKEN=""
    Tentativa_atual=0
    Maximo_de_tentativas=6
    
    while [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; do
        TOKEN=$(curl -k -s -X POST -H "Content-Type: application/json" -d "{\"username\":\"$USUARIO\",\"password\":\"$SENHA\"}" https://$PORTAINER_URL/api/auth | jq -r .jwt)
    
        Tentativa_atual=$((Tentativa_atual + 1))
    
        ## Verifica se atingiu o número máximo de tentativas
        if [ "$Tentativa_atual" -ge "$Maximo_de_tentativas" ]; then
            clear
            erro_msg
            echo "7/10 - [ OFF ] - Erro: Falha ao obter token após $Maximo_de_tentativas tentativas."
            echo "Verifique suas credenciais do Portainer para conseguirmos realizar o deploy."
            sleep 5
            criar_arquivo
            return
            #exit 1
        fi
    
        ## Se o token foi obtido com sucesso, sair do loop
        if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
            break
        fi
    
        ## Aguarda alguns segundos antes de tentar novamente
        echo -e "Tentando gerar token do portainer. Tentativa atual $bege$Tentativa_atual/5$reset"
        sleep 5
    done
    
    if [ $? -eq 0 ]; then
        esconder_senha "$TOKEN"
        echo -e "7/10 - [ OK ] - Pegando token do Portainer: $bege$SENHAOCULTA$reset"
    fi
    

    ### Verifica se o token veio vazio
    #if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
    #    echo "Erro: Falha ao obter token. Preencha com suas credenciais do portainer a seguir."
    #    sleep 5
    #    criar_arquivo
    #    #exit 1
    #fi

    ## Salva dados no arquivo do portainer
    echo -e "[ PORTAINER ]\nDominio do portainer: $PORTAINER_URL\n\nUsuario: $USUARIO\n\nSenha: $SENHA\n\nToken: $TOKEN" > "/root/dados_vps/dados_portainer"

    ## Pegando o id do portainer
    ENDPOINT_ID=$(curl -k -s -X GET -H "Authorization: Bearer $TOKEN" https://$PORTAINER_URL/api/endpoints | jq -r '.[] | select(.Name == "primary") | .Id')
    if [ $? -eq 0 ]; then
        echo -e "8/10 - [ OK ] - Pegando ID do Portainer: $bege$ENDPOINT_ID$reset"
    else
        echo "8/10 - [ OFF ] - Erro ao pegar ID do Portainer"
    fi

    ## Definindo id 1 do Portainer
    #ENDPOINT_ID=1
    
    ## Pegando o ID do Swarm
    SWARM_ID=$(curl -k -s -X GET -H "Authorization: Bearer $TOKEN" "https://$PORTAINER_URL/api/endpoints/$ENDPOINT_ID/docker/swarm" | jq -r .ID)
    if [ $? -eq 0 ]; then
        echo -e "9/10 - [ OK ] - Pegando ID do Swarm: $bege$SWARM_ID$reset"
    else
        echo "9/10 - [ OFF ] - Erro ao pegar ID do Swarm"
    fi

    ## Testa o Swarm
    SWARM_STATUS=$(docker info --format '{{.Swarm.LocalNodeState}}')
    if [ "$SWARM_STATUS" != "active" ]; then
        echo "Erro: Docker Swarm não está ativo."
        exit 1
    fi

    # Arquivo temporário para capturar a saída de erro e a resposta
    erro_output=$(mktemp)
    response_output=$(mktemp)

    ## Fazendo deploy da stack pelo portainer
    http_code=$(curl -s -o "$response_output" -w "%{http_code}" -k -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -F "Name=$STACK_NAME" \
    -F "file=@$(pwd)/$STACK_NAME.yaml" \
    -F "SwarmID=$SWARM_ID" \
    -F "endpointId=$ENDPOINT_ID" \
    "https://$PORTAINER_URL/api/stacks/create/swarm/file" 2> "$erro_output")

    response_body=$(cat "$response_output")

    if [ "$http_code" -eq 200 ]; then
        # Verifica o conteúdo da resposta para garantir que o deploy foi bem-sucedido
        if echo "$response_body" | grep -q "\"Id\""; then
            echo -e "10/10 - [ OK ] - Deploy da stack $bege$STACK_NAME$reset feito com sucesso!"
        else
            echo -e "10/10 - [ OFF ] - Erro, resposta inesperada do servidor ao tentar efetuar deploy da stack $bege$STACK_NAME$reset."
            echo "Resposta do servidor: $(echo "$response_body" | jq .)"
        fi
    else
        echo "10/10 - [ OFF ] - Erro ao efetuar deploy. Resposta HTTP: $http_code"
        echo "Mensagem de erro: $(cat "$erro_output")"
        echo "Detalhes: $(echo "$response_body" | jq .)"
    fi

    echo ""

    # Remove os arquivos temporários
    rm "$erro_output"
    rm "$response_output"
}

verificar_container_postgres() {
    if docker ps -q --filter "name=postgres_postgres" | grep -q .; then
        return 0
    else
        return 1
    fi
}

pegar_senha_postgres() {
    while :; do
        if [ -f /root/postgres.yaml ]; then
            senha_postgres=$(grep "POSTGRES_PASSWORD" /root/postgres.yaml | awk -F '=' '{print $2}')
            break
        else
            sleep 5
        fi
    done
}

criar_banco_postgres_da_stack() {
    while :; do
        if docker ps -q --filter "name=^postgres_postgres" | grep -q .; then
            CONTAINER_ID=$(docker ps -q --filter "name=^postgres_postgres")

            # Verificar se o banco de dados já existe
            docker exec "$CONTAINER_ID" psql -U postgres -lqt | cut -d \| -f 1 | grep -qw "$1"

            if [ $? -eq 0 ]; then
                ## echo ""
                read -p $'\e[33mO banco de dados '"$1"' já existe.\e[0m Deseja apagar e criar um novo banco de dados? \e[32m(Y/N)\e[0m: ' resposta
                if [ "$resposta" == "Y" ] || [ "$resposta" == "y" ]; then
                    # Apagar o banco de dados
                    docker exec "$CONTAINER_ID" psql -U postgres -c "DROP DATABASE IF EXISTS $1(force);" > /dev/null 2>&1
                    if [ $? -eq 0 ]; then
                    echo "" ## Sucesso
                    else
                        echo "" ## Erro
                    fi
                    # Criar o banco de dados novamente
                    docker exec "$CONTAINER_ID" psql -U postgres -c "CREATE DATABASE $1;" > /dev/null 2>&1
                else
                    echo ""
                fi
                break
            else
                # Criar o banco de dados
                docker exec "$CONTAINER_ID" psql -U postgres -c "CREATE DATABASE $1;" > /dev/null 2>&1
                
                # Verificar novamente se o banco de dados foi criado com sucesso
                docker exec "$CONTAINER_ID" psql -U postgres -lqt | cut -d \| -f 1 | grep -qw "$1"

                if [ $? -eq 0 ]; then
                    nada="nada"
                    break
                else
                    echo "Erro ao criar o banco de dados. Tentando novamente..."
                    echo ""
                fi
            fi
        else
            sleep 5
        fi
    done
}

pull() {
    for image in "$@"; do
        while true; do
            if docker pull "$image" > /dev/null 2>&1; then
                sleep 1
                break
            else
                echo -e "⚠️  \e[31mFalha ao baixar \e[33m$image\e[31m. Tentando novamente...\e[0m"
                
                # Verifica se o erro é relacionado a limite de taxa
                if docker pull "$image" 2>&1 | grep -q "toomanyrequests"; then
                    echo -e "\e[31m🚫 Limite de taxa do Docker Hub atingido!\e[0m \nPor favor, faça login para continuar."
                    docker login
                else
                    echo -e "⚠️ \e[31mErro inesperado ocorreu. Repetindo tentativa em 5 segundos...\e[0m"
                    sleep 5
                fi
            fi
        done
    done
}

verificar_container_pgvector() {
    if docker ps -q --filter "name=pgvector_pgvector" | grep -q .; then
        return 0
    else
        return 1
    fi
}

criar_banco_pgvector_da_stack() {
    while :; do
        if docker ps -q --filter "name=^pgvector_pgvector" | grep -q .; then
            CONTAINER_PGVECTOR_ID=$(docker ps -q --filter "name=^pgvector_pgvector")

            # Verificar se o banco de dados já existe
            docker exec "$CONTAINER_PGVECTOR_ID" psql -U postgres -lqt | cut -d \| -f 1 | grep -qw "$1"

            if [ $? -eq 0 ]; then
                echo ""
                read -p "[33mO banco de dados '"$1"' já existe.\e[0m Deseja apagar e criar um novo banco de dados? \e[32m(Y/N)\e[0m: " resposta
                if [ "$resposta" == "Y" ] || [ "$resposta" == "y" ]; then
                    # Apagar o banco de dados
                    docker exec "$CONTAINER_PGVECTOR_ID" psql -U postgres -c "DROP DATABASE IF EXISTS $1(force);" > /dev/null 2>&1
                    if [ $? -eq 0 ]; then
                    echo "" ## Sucesso
                    else
                        echo "" ## Erro
                    fi
                    # Criar o banco de dados novamente
                    docker exec "$CONTAINER_PGVECTOR_ID" psql -U postgres -c "CREATE DATABASE $1;" > /dev/null 2>&1
                else
                    echo ""
                fi
                break
            else
                # Criar o banco de dados
                docker exec "$CONTAINER_PGVECTOR_ID" psql -U postgres -c "CREATE DATABASE $1;" > /dev/null 2>&1
                
                # Verificar novamente se o banco de dados foi criado com sucesso
                docker exec "$CONTAINER_PGVECTOR_ID" psql -U postgres -lqt | cut -d \| -f 1 | grep -qw "$1"

                if [ $? -eq 0 ]; then
                    nada="nada"
                    break
                else
                    echo -e "\e[31mErro ao criar o banco de dados. Tentando novamente...\e[0m"
                    echo ""

                fi
            fi
        else
            sleep 5
        fi
    done
}

pegar_senha_pgvector() {
    while :; do
        if [ -f /root/pgvector.yaml ]; then
            senha_pgvector=$(grep "POSTGRES_PASSWORD" /root/pgvector.yaml | awk -F '=' '{print $2}')
            break
        else
            sleep 5
        fi
    done
}

wait_for_pgvector() {
    dados
    local container_name="pgvector_pgvector"

    while true; do
        CONTAINER_ID=$(docker ps -q --filter "name=.*$container_name.*")

        if [ -n "$CONTAINER_ID" ]; then

            break
        fi

        sleep 5
    done
}

verificar_container_redis() {
    if docker ps -q --filter "name=redis_redis" | grep -q .; then
        return 0
    else
        return 1
    fi
}

ferramenta_traefik_e_portainer() {

  msg_traefik_portainer
  while true; do

    echo -e "Passo \e[33m1/6\e[0m"
    echo -ne "\e[36mDigite o domínio para o Portainer (ex: portainer.encha.ai): \e[0m" && read -r url_portainer
    echo ""


    echo -e "\e[97mPasso$amarelo 2/6\e[0m"
    echo -en "\e[33mDigite um usuario para o Portainer (ex: admin): \e[0m" && read -r user_portainer
    echo ""

    while true; do
    echo -e "Passo \e[33m3/6\e[0m"
    echo -e "\e[33m--> Mínimo 12 caracteres. Use letras MAIÚSCULAS e minúsculas, números e um caractere especial @ ou _\e[0m"
    echo -e "\e[33m--> Evite caracteres especiais como: \\!#$\e[0m"
    echo -ne "\e[36mDigite uma senha para o Portainer (ex: Porta@12345_): \e[0m" && read -r pass_portainer
    echo ""


      if validar_senha "$pass_portainer" 12; then
          break
      fi
      echo ""
    done

    echo -e "Passo \e[33m4/6\e[0m"
    echo -e "\e[33m--> Não pode conter espaços e/ou caracteres especiais.\e[0m"
    echo -ne "\e[36mEscolha um nome para o seu servidor (ex: Encha): \e[0m" && read -r nome_servidor
    echo ""


    echo -e "Passo \e[33m5/6\e[0m"
    echo -e "\e[33m--> Não pode conter espaços e/ou caracteres especiais.\e[0m"
    echo -ne "\e[36mDigite um nome para sua rede interna (ex: EnchaNet): \e[0m" && read -r nome_rede_interna
    echo ""

    echo -e "Passo \e[33m6/6\e[0m"
    echo -ne "\e[36mDigite um endereço de email válido (ex: atendimento@encha.ai): \e[0m" && read -r email_ssl
    echo ""


    clear

    echo -e "\e[33mLink do Portainer:\e[97m $url_portainer\e[0m\n"
    echo -e "\e[33mUsuário do Portainer:\e[97m $user_portainer\e[0m\n"
    echo -e "\e[33mSenha do Portainer:\e[97m $pass_portainer\e[0m\n"
    echo -e "\e[33mNome do Servidor:\e[97m $nome_servidor\e[0m\n"
    echo -e "\e[33mRede interna:\e[97m $nome_rede_interna\e[0m\n"
    echo -e "\e[33mEmail:\e[97m $email_ssl\e[0m\n"


    read -p $'\e[33mAs respostas estão corretas?\e[0m \e[32m(Y/N)\e[0m: ' confirmacao
    if [[ "$confirmacao" =~ ^[Yy]$ ]]; then
        clear
        break
    else
        msg_traefik_portainer
    fi
  done

  echo -e "⚙️ \e[97mIniciando a instalação do Traefik \e[33m[1/9]\e[0m\n"
  sleep 1

  cd ~ || exit 1

  if [ ! -d "dados_vps" ]; then
      mkdir dados_vps
  fi

  cd dados_vps || exit 1

  cat > dados_vps << EOL
[DADOS DA VPS]

Nome do Servidor: $nome_servidor
Rede interna: $nome_rede_interna
Email para SSL: $email_ssl
Link do Portainer: $url_portainer


EOL

  cd ~ || exit 1

  ## Atualizando e configurando VPS
  echo -e "\e[97m• ATUALIZANDO E CONFIGURANDO A VPS \e[33m[2/9]\e[0m\n"
  sleep 1

  sudo apt-get update -y > /dev/null 2>&1 && echo -e "1/9 - [\e[32mOK\e[0m] - Update concluído." || echo -e "1/9 - [\e[31mFALHOU\e[0m] - Falha no Update."
  sudo apt-get upgrade -y > /dev/null 2>&1 && echo -e "2/9 - [\e[32mOK\e[0m] - Upgrade concluído." || echo -e "2/9 - [\e[31mFALHOU\e[0m] - Falha no Upgrade."
  sudo timedatectl set-timezone America/Sao_Paulo > /dev/null 2>&1 && echo -e "3/9 - [\e[32mOK\e[0m] - Timezone configurado." || echo -e "3/9 - [\e[31mFALHOU\e[0m] - Falha ao configurar Timezone."
  sudo apt-get install -y apt-utils > /dev/null 2>&1 && echo -e "4/9 - [\e[32mOK\e[0m] - Apt-Utils instalado." || echo -e "4/9 - [\e[31mFALHOU\e[0m] - Falha na instalação do Apt-Utils."
  sudo apt-get update -y > /dev/null 2>&1 && echo -e "5/9 - [\e[32mOK\e[0m] - Update concluído." || echo -e "5/9 - [\e[31mFALHOU\e[0m] - Falha no Update."
  sudo hostnamectl set-hostname "$nome_servidor" > /dev/null 2>&1 && echo -e "6/9 - [\e[32mOK\e[0m] - Hostname definido." || echo -e "6/9 - [\e[31mFALHOU\e[0m] - Falha ao definir Hostname."
  sudo sed -i "s/127.0.0.1[[:space:]]localhost/127.0.0.1 $nome_servidor localhost/g" /etc/hosts > /dev/null 2>&1 && echo -e "7/9 - [\e[32mOK\e[0m] - Nome do servidor adicionado ao /etc/hosts." || echo -e "7/9 - [\e[31mFALHOU\e[0m] - Falha ao editar /etc/hosts."
  sudo apt-get update -y > /dev/null 2>&1 && echo -e "8/9 - [\e[32mOK\e[0m] - Update concluído." || echo -e "8/9 - [\e[31mFALHOU\e[0m] - Falha no Update."
  sudo apt-get install -y apparmor-utils > /dev/null 2>&1 && echo -e "9/9 - [\e[32mOK\e[0m] - Apparmor-Utils instalado." || echo -e "9/9 - [\e[31mFALHOU\e[0m] - Falha na instalação do Apparmor-Utils."
  echo ""


  echo -e "⚙️ \e[97mInstalando Docker Swarm \e[33m[3/9]\e[0m\n"
  sleep 1

  
  # Pegando IP válido
  ip=$(hostname -I | tr ' ' '\n' | grep -vE '^(127\.0\.0\.1|10\.)' | head -n 1)

  if [ -n "$ip" ]; then
      echo -e "1/3 - [\e[32mOK\e[0m] - IP obtido: \e[33m$ip\e[0m"
  else
      echo -e "1/3 - [\e[31mFALHOU\e[0m] - Não foi possível obter o IP"
      exit 1
  fi

  curl -fsSL https://get.docker.com | sudo bash > /dev/null 2>&1
  if [ $? -eq 0 ]; then
      echo -e "2/3 - [\e[32mOK\e[0m] - Docker baixado e instalado com sucesso"
  else
      echo -e "2/3 - [\e[31mFALHOU\e[0m] - Erro ao baixar e instalar o Docker"
      exit 1
  fi


  sudo systemctl enable docker > /dev/null 2>&1
  sudo systemctl start docker > /dev/null 2>&1

  max_attempts=3
  attempt=1

  while [ $attempt -le $max_attempts ]; do
      sudo docker swarm init --advertise-addr "$ip" > /dev/null 2>&1
      if [ $? -eq 0 ]; then
          echo -e "3/3 - [\e[32mOK\e[0m] - Swarm iniciado com sucesso"
          break
      else
          echo -e "3/3 - [\e[31mFALHOU\e[0m] - Falha ao iniciar o Swarm"
          echo -e "\e[33mOps! Não foi possível iniciar o Swarm. Tentativa \e[36m$attempt\e[33m de \e[36m$max_attempts\e[33m...\e[0m"
          attempt=$((attempt + 1))
          sleep 5
      fi
  done

  if [ $attempt -gt $max_attempts ]; then
      echo -e "\e[31mNão foi possível iniciar o Swarm após \e[33m$max_attempts\e[31m tentativas...\e[0m"
      echo -e "\e[33mRecomendo formatar a VPS e tentar novamente.\e[0m"
      echo -e "\e[33mLembre-se: o primeiro requisito é usar uma VPS vazia.\e[0m"
      sleep 10
      exit 1
  fi

  echo ""

 

  echo -e "🔗 \e[97mCriando rede interna \e[33m[4/9]\e[0m\n"
  sleep 1

  sudo docker network create --driver=overlay "$nome_rede_interna" > /dev/null 2>&1
  if [ $? -eq 0 ]; then
      echo -e "1/1 - [\e[32mOK\e[0m] - Rede interna configurada com sucesso"
  else
      echo -e "1/1 - [\e[31mFALHOU\e[0m] - Falha ao configurar a rede interna"
  fi
  echo ""

  echo -e "🚀 \e[97mInstalando Traefik \e[33m[5/9]\e[0m\n"
  sleep 1


  # Criar arquivo traefik.yaml (mantive seu conteúdo original)

  cat > traefik.yaml << EOL
version: "3.7"
services:

  traefik:
    image: traefik:v3.4.0
    command:
      - "--api.dashboard=true"
      - "--providers.swarm=true"
      - "--providers.docker.endpoint=unix:///var/run/docker.sock"
      - "--providers.docker.exposedbydefault=false"
      - "--providers.docker.network=$nome_rede_interna"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.web.http.redirections.entryPoint.to=websecure"
      - "--entrypoints.web.http.redirections.entryPoint.scheme=https"
      - "--entrypoints.web.http.redirections.entrypoint.permanent=true"
      - "--entrypoints.websecure.address=:443"
      - "--entrypoints.web.transport.respondingTimeouts.idleTimeout=3600"
      - "--certificatesresolvers.letsencryptresolver.acme.httpchallenge=true"
      - "--certificatesresolvers.letsencryptresolver.acme.httpchallenge.entrypoint=web"
      - "--certificatesresolvers.letsencryptresolver.acme.storage=/etc/traefik/letsencrypt/acme.json"
      - "--certificatesresolvers.letsencryptresolver.acme.email=$email_ssl"
      - "--log.level=DEBUG"
      - "--log.format=common"
      - "--log.filePath=/var/log/traefik/traefik.log"
      - "--accesslog=true"
      - "--accesslog.filepath=/var/log/traefik/access-log"

    volumes:
      - "vol_certificates:/etc/traefik/letsencrypt"
      - "/var/run/docker.sock:/var/run/docker.sock:ro"

    networks:
      - $nome_rede_interna

    ports:
      - target: 80
        published: 80
        mode: host
      - target: 443
        published: 443
        mode: host

    deploy:
      placement:
        constraints:
          - node.role == manager
      labels:
        - "traefik.enable=true"
        - "traefik.http.middlewares.redirect-https.redirectscheme.scheme=https"
        - "traefik.http.middlewares.redirect-https.redirectscheme.permanent=true"
        - "traefik.http.routers.http-catchall.rule=Host(\`{host:.+}\`)"
        - "traefik.http.routers.http-catchall.entrypoints=web"
        - "traefik.http.routers.http-catchall.middlewares=redirect-https@docker"
        - "traefik.http.routers.http-catchall.priority=1"

volumes:
  vol_shared:
    external: true
    name: volume_swarm_shared
  vol_certificates:
    external: true
    name: volume_swarm_certificates

networks:
  $nome_rede_interna:
    external: true
    attachable: true
    name: $nome_rede_interna
EOL

    if [ $? -eq 0 ]; then
        echo -e "1/2 - [\e[32mOK\e[0m] - Stack criada com sucesso"
    else
        echo -e "1/2 - [\e[31mFALHOU\e[0m] - Falha ao criar a stack do Traefik"
        echo -e "\e[33mOps, não foi possível criar a stack do Traefik.\e[0m"
    fi

  sudo docker stack deploy --prune --resolve-image always -c traefik.yaml traefik > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "2/2 - [\e[32mOK\e[0m] - Stack deployada com sucesso"
    else
        echo -e "2/2 - [\e[31mFALHOU\e[0m] - Falha ao realizar o deploy da stack"
        echo -e "\e[33mOps, não foi possível subir o Traefik.\e[0m"
    fi

  echo ""

  echo -e "⏳ \e[97mEsperando o Traefik ficar online \e[33m[6/9]\e[0m\n"
  sleep 1

  wait_stack "traefik"  # Certifique-se que essa função existe

 

  wait_30_sec

  echo -e "📦 \e[97mInstalando Portainer \e[33m[7/9]\e[0m\n"
  sleep 1

 

  cat > portainer.yaml <<EOL
version: "3.7"
services:

  agent:
    image: portainer/agent:latest
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /var/lib/docker/volumes:/var/lib/docker/volumes
    networks:
      - $nome_rede_interna
    deploy:
      mode: global
      placement:
        constraints: [node.platform.os == linux]

  portainer:
    image: portainer/portainer-ce:latest
    command: -H tcp://tasks.agent:9001 --tlsskipverify
    volumes:
      - portainer_data:/data
    networks:
      - $nome_rede_interna
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints: [node.role == manager]
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.portainer.rule=Host(\`$url_portainer\`)"
        - "traefik.http.services.portainer.loadbalancer.server.port=9000"
        - "traefik.http.routers.portainer.tls.certresolver=letsencryptresolver"
        - "traefik.http.routers.portainer.service=portainer"
        - "traefik.docker.network=$nome_rede_interna"
        - "traefik.http.routers.portainer.entrypoints=websecure"
        - "traefik.http.routers.portainer.priority=1"

volumes:
  portainer_data:
    external: true
    name: portainer_data

networks:
  $nome_rede_interna:
    external: true
    attachable: true
    name: $nome_rede_interna
EOL

  if [ $? -eq 0 ]; then
      echo -e "1/2 - [\e[32mOK\e[0m] - Stack criada com sucesso"
  else
      echo -e "1/2 - [\e[31mFALHOU\e[0m] - Falha ao criar a stack do Portainer"
      echo -e "\e[33mOps, não foi possível criar a stack do Portainer.\e[0m"
  fi

  sudo docker stack deploy --prune --resolve-image always -c portainer.yaml portainer > /dev/null 2>&1
  if [ $? -eq 0 ]; then
      echo -e "2/2 - [\e[32mOK\e[0m] - Stack deployada com sucesso"
  else
      echo -e "2/2 - [\e[31mFALHOU\e[0m] - Falha ao fazer o deploy da stack"
      echo -e "\e[33mOps, não foi possível subir a stack do Portainer.\e[0m"
  fi

  echo ""

  echo -e "⏳ \e[97mEsperando o Portainer ficar online \e[33m[8/9]\e[0m\n"
  sleep 1

  wait_stack "portainer"  # Certifique-se que essa função existe

  sleep 5



  echo -e "🛠️ \e[97mCriando conta no Portainer \e[33m[9/9]\e[0m\n"
  sleep 30

## Tenta criar usuário no Portainer até 4 vezes
MAX_RETRIES=4
DELAY=15  # Delay de 15 segundos entre as tentativas
CONTA_CRIADA=false

for i in $(seq 1 $MAX_RETRIES); do
  RESPONSE=$(curl -k -s -X POST "https://$url_portainer/api/users/admin/init" \
    -H "Content-Type: application/json" \
    -d "{\"Username\": \"$user_portainer\", \"Password\": \"$pass_portainer\"}")

  # Verificar se o campo "Username" existe na resposta
  if echo "$RESPONSE" | grep -q "\"Username\":\"$user_portainer\""; then
    echo -e "1/2 - [\e[32mOK\e[0m] - Conta de administrador criada com sucesso! 🎉"
    CONTA_CRIADA=true
    break
  else
    echo -e "⏳ Tentando criar conta no Portainer \e[33m$i/4\e[0m..."
    # Se for a última tentativa, exibe mensagem de erro final
    if [ $i -eq $MAX_RETRIES ]; then
      echo -e "1/2 - [\e[31mFALHOU\e[0m] - Não foi possível criar a conta de administrador após \e[33m$MAX_RETRIES\e[0m tentativas."
      echo -e "Erro retornado: \e[31m$RESPONSE\e[0m"
      echo -e "\e[33mApós a conclusão da instalação, por favor, crie uma conta acessando o link do seu Portainer.\e[0m"
      CONTA_CRIADA=false
      sleep 10
    fi
    sleep $DELAY
  fi
done

# Só tenta criar o token se a conta foi criada com sucesso
if [ "$CONTA_CRIADA" = true ]; then
  sleep 5
  ## Cria primeiro token do Portainer
  token=$(curl -k -s -X POST "https://$url_portainer/api/auth" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$user_portainer\",\"password\":\"$pass_portainer\"}" | jq -r .jwt)
  
  # Verifica se o token foi gerado com sucesso
  if [ -n "$token" ] && [ "$token" != "null" ]; then
    echo -e "2/2 - [\e[32mOK\e[0m] - Primeiro token gerado com sucesso"
  else
    echo -e "2/2 - [\e[31mFALHOU\e[0m] - Falha ao gerar o token"
    exit 1
  fi
fi

sleep 5
## Salvando informações da instalação dentro de /dados_vps/
cd dados_vps

if [ "$CONTA_CRIADA" = true ]; then
  cat > dados_portainer <<EOL
[ PORTAINER ]

Dominio do portainer: https://$url_portainer

Usuario: $user_portainer

Senha: $pass_portainer

Token: $token
EOL
else
  cat > dados_portainer <<EOL
[ PORTAINER ]

Dominio do portainer: https://$url_portainer

Usuario: Precisa criar dentro do portainer

Senha: Precisa criar dentro do portainer
EOL
fi

cd
cd

## Espera 30 segundos
wait_30_sec

msg_resumo_informacoes

## Dados da Aplicação:
echo -e "\e[32m🚀 [ PORTAINER INSTALADO COM SUCESSO ]\e[0m"
echo ""

echo -e "\e[97mDomínio do Portainer:\e[33m https://$url_portainer\e[0m\n"

if [ "$CONTA_CRIADA" = true ]; then
  echo -e "\e[97mUsuário:\e[33m $user_portainer\e[0m\n"
  echo -e "\e[97mSenha:\e[33m $pass_portainer\e[0m\n"
else
  echo -e "\e[97mUsuário:\e[31m Precisa criar dentro do Portainer\e[0m\n"
  echo -e "\e[97mSenha:\e[31m Precisa criar dentro do Portainer\e[0m\n"
  echo -e "\e[97mObservação:\e[33m Você tem menos de 5 minutos para criar uma conta no Portainer."
fi

msg_retorno_menu


}

ferramenta_postgres() {

## Ativa a função dados para pegar os dados da vps
dados


## Gerando uma senha aleatória para o Postgres
senha_postgres=$(openssl rand -hex 16)

## Criando a stack postgres.yaml
cat > postgres.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  postgres:
    image: postgres:14 ## Versão do postgres
    command: >
      postgres
      -c max_connections=500
      -c shared_buffers=512MB

    volumes:
      - postgres_data:/var/lib/postgresql/data

    networks:
      - $nome_rede_interna ## Nome da rede interna

    ## Descomente as linhas abaixo para uso externo
    #ports:
    #  - 5432:5432

    environment:
      ## Senha do postgres 
      - POSTGRES_PASSWORD=$senha_postgres

      ## Timezone
      - TZ=America/Sao_Paulo

    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      resources:
        limits:
          cpus: "1"
          memory: 1024M

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

volumes:
  postgres_data:
    external: true
    name: postgres_data

networks:
  $nome_rede_interna: ## Nome da rede interna
    external: true
    name: $nome_rede_interna ## Nome da rede interna
EOL
if [ $? -eq 0 ]; then
    echo -e "1/10 - [\e[32mOK\e[0m] - Stack do Postgres criada com sucesso"
else
    echo -e "1/10 - [\e[31mFALHOU\e[0m] - Falha ao criar a stack do Postgres"
    echo -e "\e[33mNão foi possível criar a stack do Postgres.\e[0m"
fi
STACK_NAME="postgres"
stack_editavel #> /dev/null 2>&1

cd dados_vps

cat > dados_postgres <<EOL
[ POSTGRES ]

Dominio do postgres: postgres://postgres:5432

Usuario: postgres

Senha: $senha_postgres
EOL

cd
cd

## Espera 30 segundos
wait_stack "postgres_postgres"

echo ""
}

ferramenta_evolution() {


msg_evolution_api
## Limpa o terminal

## Ativa a função dados para pegar os dados da vps
dados



## Inicia um Loop até os dados estarem certos
while true; do

    ##Pergunta o Dominio para aplicação
    echo -e "\e[97mPasso\e[33m 1/1\e[0m"
    echo -en "\e[33mDigite o domínio para a Evolution API (ex: evolution.encha.ai): \e[0m" && read -r url_evolution
    echo ""

    ## Limpa o terminal
    clear
    


    ## Informação sobre URL
    echo -e "\e[33mDomínio da Evolution API:\e[97m $url_evolution\e[0m"
    echo ""

    ## Pergunta se as respostas estão corretas
  
    read -p $'\e[33mA resposta está correta?\e[0m \e[32m(Y/N)\e[0m: ' confirmacao
    if [ "$confirmacao" = "Y" ] || [ "$confirmacao" = "y" ]; then

        clear

        ## Mostrar mensagem de Instalando
        ## Sai do Loop
        break
    else

        ## Digitou N para dizer que as informações não estão corretas.
        msg_evolution_api


    ## Volta para o inicio do loop com as perguntas
    fi
done

## Mensagem de Passo
echo -e "🚀 \e[97mIniciando a instalação da Evolution API \e[33m[1/4]\e[0m"
echo ""
sleep 1


## Literalmente nada, apenas um espaço vazio caso precisar de adicionar alguma coisa
## Antes..
## E claro, para aparecer a mensagem do passo..

## Mensagem de Passo
echo -e "🔍 \e[97mVerificando/Instalando Postgres \e[33m[2/4]\e[0m"
echo ""
sleep 1

## Aqui vamos fazer uma verificação se já existe Postgres Instalado
## Se tiver ele vai criar um banco de dados no postgres ou perguntar se deseja apagar o que já existe e criar outro

## Verifica container postgres e cria banco no postgres

verificar_container_postgres
if [ $? -eq 0 ]; then
    echo "🔍 Etapa 1/3: Verificando instalação do Postgres... [OK]"
    pegar_senha_postgres > /dev/null 2>&1
    echo "🔐 Etapa 2/3: Copiando a senha do Postgres... [OK]"
    criar_banco_postgres_da_stack "evolution${1:+_$1}"
    echo "🛠️ Etapa 3/3: Criando o banco de dados 'evolution${1:+_$1}'... [OK]"
    echo ""
else
    ferramenta_postgres
    pegar_senha_postgres > /dev/null 2>&1
    criar_banco_postgres_da_stack "evolution${1:+_$1}"
fi

pegar_senha_postgres > /dev/null 2>&1

## Mensagem de Passo
echo -e "\e[97m🔧 Instalando a Evolution API...\e[33m [Etapa 3 de 4]\e[0m"
echo ""
sleep 1

## Aqui de fato vamos iniciar a instalação da Evolution API

## Criando uma Global Key Aleatória
apikeyglobal=$(openssl rand -hex 16)

## Criando a stack evolution.yaml
cat > evolution${1:+_$1}.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  evolution${1:+_$1}_api:
    image: evoapicloud/evolution-api:latest ## Versão da Evolution API

    volumes:
      - evolution${1:+_$1}_instances:/evolution/instances

    networks:
      - $nome_rede_interna ## Nome da rede interna

    environment:
      ## ⚙️ Configurações Gerais
      - SERVER_URL=https://$url_evolution
      - AUTHENTICATION_API_KEY=$apikeyglobal
      - AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES=true
      - DEL_INSTANCE=false
      - QRCODE_LIMIT=1902
      - LANGUAGE=pt-BR
      
      ## 📱 Configuração do Cliente
      ## Pegue a versão em: https://web.whatsapp.com/sw.js
      #- CONFIG_SESSION_PHONE_VERSION=2.3000.1023015479
      - CONFIG_SESSION_PHONE_CLIENT=Encha
      - CONFIG_SESSION_PHONE_NAME=Chrome
      
      ## 🗄️ Configuração do Banco de Dados
      - DATABASE_ENABLED=true
      - DATABASE_PROVIDER=postgresql
      - DATABASE_CONNECTION_URI=postgresql://postgres:$senha_postgres@postgres:5432/evolution${1:+_$1}
      - DATABASE_CONNECTION_CLIENT_NAME=evolution${1:+_$1}
      - DATABASE_SAVE_DATA_INSTANCE=true
      - DATABASE_SAVE_DATA_NEW_MESSAGE=true
      - DATABASE_SAVE_MESSAGE_UPDATE=true
      - DATABASE_SAVE_DATA_CONTACTS=true
      - DATABASE_SAVE_DATA_CHATS=true
      - DATABASE_SAVE_DATA_LABELS=true
      - DATABASE_SAVE_DATA_HISTORIC=true

      ## 🤖 Integração com N8N
      - N8N_ENABLED=true

      ## 🤖 Integração com EvoAI
      - EVOAI_ENABLED=true
      
      ## 🤖 Integração com OpenAI
      - OPENAI_ENABLED=true
      
      ## 🌐 Integração com Dify
      - DIFY_ENABLED=true
      
      ## 💬 Integração com Typebot
      - TYPEBOT_ENABLED=true
      - TYPEBOT_API_VERSION=latest
      
      ## 🗣️ Integração com Chatwoot
      - CHATWOOT_ENABLED=true
      - CHATWOOT_MESSAGE_READ=true
      - CHATWOOT_MESSAGE_DELETE=true
      - CHATWOOT_IMPORT_DATABASE_CONNECTION_URI=postgresql://postgres:SENHA_DO_PGVECTOR@pgvector:5432/chatwoot?sslmode=disable
      - CHATWOOT_IMPORT_PLACEHOLDER_MEDIA_MESSAGE=false
      
      ## 🧊 Configuração do Cache
      - CACHE_REDIS_ENABLED=true
      - CACHE_REDIS_URI=redis://evolution${1:+_$1}_redis:6379/1
      - CACHE_REDIS_PREFIX_KEY=evolution
      - CACHE_REDIS_SAVE_INSTANCES=false
      - CACHE_LOCAL_ENABLED=false
      
      ## ☁️ Configuração do S3
      - S3_ENABLED=false
      - S3_ACCESS_KEY=
      - S3_SECRET_KEY=
      - S3_BUCKET=evolution
      - S3_PORT=443
      - S3_ENDPOINT=
      - S3_USE_SSL=true
      #- S3_REGION=eu-south

      ## 💼 Configuração do WhatsApp Business
      - WA_BUSINESS_TOKEN_WEBHOOK=evolution
      - WA_BUSINESS_URL=https://graph.facebook.com
      - WA_BUSINESS_VERSION=v21.0
      - WA_BUSINESS_LANGUAGE=pt_BR

      ## 📊 Telemetria
      - TELEMETRY=false
      - TELEMETRY_URL=

      ## 🌐 Configuração do WebSocket
      - WEBSOCKET_ENABLED=false
      - WEBSOCKET_GLOBAL_EVENTS=false

      ## 📨 Configuração do SQS
      - SQS_ENABLED=false
      - SQS_ACCESS_KEY_ID=
      - SQS_SECRET_ACCESS_KEY=
      - SQS_ACCOUNT_ID=
      - SQS_REGION=

      ## 🐇 Configuração do RabbitMQ
      - RABBITMQ_ENABLED=false
      - RABBITMQ_FRAME_MAX=8192
      - RABBITMQ_URI=amqp://USER:PASS@rabbitmq:5672/evolution${1:+_$1}
      - RABBITMQ_EXCHANGE_NAME=evolution
      - RABBITMQ_GLOBAL_ENABLED=false
      - RABBITMQ_EVENTS_APPLICATION_STARTUP=false
      - RABBITMQ_EVENTS_INSTANCE_CREATE=false
      - RABBITMQ_EVENTS_INSTANCE_DELETE=false
      - RABBITMQ_EVENTS_QRCODE_UPDATED=false
      - RABBITMQ_EVENTS_SEND_MESSAGE_UPDATE=false
      - RABBITMQ_EVENTS_MESSAGES_SET=false
      - RABBITMQ_EVENTS_MESSAGES_UPSERT=true
      - RABBITMQ_EVENTS_MESSAGES_EDITED=false
      - RABBITMQ_EVENTS_MESSAGES_UPDATE=false
      - RABBITMQ_EVENTS_MESSAGES_DELETE=false
      - RABBITMQ_EVENTS_SEND_MESSAGE=false
      - RABBITMQ_EVENTS_CONTACTS_SET=false
      - RABBITMQ_EVENTS_CONTACTS_UPSERT=false
      - RABBITMQ_EVENTS_CONTACTS_UPDATE=false
      - RABBITMQ_EVENTS_PRESENCE_UPDATE=false
      - RABBITMQ_EVENTS_CHATS_SET=false
      - RABBITMQ_EVENTS_CHATS_UPSERT=false
      - RABBITMQ_EVENTS_CHATS_UPDATE=false
      - RABBITMQ_EVENTS_CHATS_DELETE=false
      - RABBITMQ_EVENTS_GROUPS_UPSERT=false
      - RABBITMQ_EVENTS_GROUP_UPDATE=false
      - RABBITMQ_EVENTS_GROUP_PARTICIPANTS_UPDATE=false
      - RABBITMQ_EVENTS_CONNECTION_UPDATE=true
      - RABBITMQ_EVENTS_CALL=false
      - RABBITMQ_EVENTS_TYPEBOT_START=false
      - RABBITMQ_EVENTS_TYPEBOT_CHANGE_STATUS=false

      ## 🌐 Configuração do Webhook
      - WEBHOOK_GLOBAL_ENABLED=false
      - WEBHOOK_GLOBAL_URL=
      - WEBHOOK_GLOBAL_WEBHOOK_BY_EVENTS=false
      - WEBHOOK_EVENTS_APPLICATION_STARTUP=false
      - WEBHOOK_EVENTS_QRCODE_UPDATED=false
      - WEBHOOK_EVENTS_MESSAGES_SET=false
      - WEBHOOK_EVENTS_SEND_MESSAGE_UPDATE=false
      - WEBHOOK_EVENTS_MESSAGES_UPSERT=false
      - WEBHOOK_EVENTS_MESSAGES_EDITED=false
      - WEBHOOK_EVENTS_MESSAGES_UPDATE=false
      - WEBHOOK_EVENTS_MESSAGES_DELETE=false
      - WEBHOOK_EVENTS_SEND_MESSAGE=false
      - WEBHOOK_EVENTS_CONTACTS_SET=false
      - WEBHOOK_EVENTS_CONTACTS_UPSERT=false
      - WEBHOOK_EVENTS_CONTACTS_UPDATE=false
      - WEBHOOK_EVENTS_PRESENCE_UPDATE=false
      - WEBHOOK_EVENTS_CHATS_SET=false
      - WEBHOOK_EVENTS_CHATS_UPSERT=false
      - WEBHOOK_EVENTS_CHATS_UPDATE=false
      - WEBHOOK_EVENTS_CHATS_DELETE=false
      - WEBHOOK_EVENTS_GROUPS_UPSERT=false
      - WEBHOOK_EVENTS_GROUPS_UPDATE=false
      - WEBHOOK_EVENTS_GROUP_PARTICIPANTS_UPDATE=false
      - WEBHOOK_EVENTS_CONNECTION_UPDATE=false
      - WEBHOOK_EVENTS_LABELS_EDIT=false
      - WEBHOOK_EVENTS_LABELS_ASSOCIATION=false
      - WEBHOOK_EVENTS_CALL=false
      - WEBHOOK_EVENTS_TYPEBOT_START=false
      - WEBHOOK_EVENTS_TYPEBOT_CHANGE_STATUS=false
      - WEBHOOK_EVENTS_ERRORS=false
      - WEBHOOK_EVENTS_ERRORS_WEBHOOK=
      - WEBHOOK_REQUEST_TIMEOUT_MS=60000
      - WEBHOOK_RETRY_MAX_ATTEMPTS=10
      - WEBHOOK_RETRY_INITIAL_DELAY_SECONDS=5
      - WEBHOOK_RETRY_USE_EXPONENTIAL_BACKOFF=true
      - WEBHOOK_RETRY_MAX_DELAY_SECONDS=300
      - WEBHOOK_RETRY_JITTER_FACTOR=0.2
      - WEBHOOK_RETRY_NON_RETRYABLE_STATUS_CODES=400,401,403,404,422

      ## 🔌 Configuração do Provider
      - PROVIDER_ENABLED=false
      - PROVIDER_HOST=127.0.0.1
      - PROVIDER_PORT=5656
      - PROVIDER_PREFIX=evolution${1:+_$1}
      
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
        - node.role == manager
      labels:
        - traefik.enable=1
        - traefik.http.routers.evolution${1:+_$1}.rule=Host(\`$url_evolution\`) ## Url da Evolution API
        - traefik.http.routers.evolution${1:+_$1}.entrypoints=websecure
        - traefik.http.routers.evolution${1:+_$1}.priority=1
        - traefik.http.routers.evolution${1:+_$1}.tls.certresolver=letsencryptresolver
        - traefik.http.routers.evolution${1:+_$1}.service=evolution${1:+_$1}
        - traefik.http.services.evolution${1:+_$1}.loadbalancer.server.port=8080
        - traefik.http.services.evolution${1:+_$1}.loadbalancer.passHostHeader=true

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  evolution${1:+_$1}_redis:
    image: redis:latest  ## Versão do Redis
    command: [
        "redis-server",
        "--appendonly",
        "yes",
        "--port",
        "6379"
      ]

    volumes:
      - evolution${1:+_$1}_redis:/data

    networks:
      - $nome_rede_interna ## Nome da rede interna

    ## Descomente as linhas abaixo para uso externo
    #ports:
    #  - 6379:6379

    deploy:
      placement:
        constraints:
          - node.role == manager
      resources:
        limits:
          cpus: "1"
          memory: 1024M

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

volumes:
  evolution${1:+_$1}_instances:
    external: true
    name: evolution${1:+_$1}_instances
  evolution${1:+_$1}_redis:
    external: true
    name: evolution${1:+_$1}_redis

networks:
  $nome_rede_interna: ## Nome da rede interna
    external: true
    name: $nome_rede_interna ## Nome da rede interna
EOL
if [ $? -eq 0 ]; then
    echo "1/10 - [ OK ] - Criando Stack"
else
    echo "1/10 - [ OFF ] - Criando Stack"
    echo "Não foi possivel criar a stack da Evolution API"
fi
STACK_NAME="evolution${1:+_$1}"
stack_editavel # > /dev/null 2>&1
#docker stack deploy --prune --resolve-image always -c evolution.yaml evolution > /dev/null 2>&1


sleep 10

## Mensagem de Passo
echo -e "\e[97m🔍 Verificando o serviço...\e[33m [Etapa 4 de 4]\e[0m"
echo ""
sleep 1

## Baixando imagens:
pull redis:latest evoapicloud/evolution-api:latest

## Usa o serviço wait_evolution para verificar se o serviço esta online
wait_stack evolution${1:+_$1}_evolution${1:+_$1}_redis evolution${1:+_$1}_evolution${1:+_$1}_api


cd dados_vps

cat > dados_evolution${1:+_$1} <<EOL
[ EVOLUTION API ]

Manager Evolution: https://$url_evolution/manager

URL: https://$url_evolution

Global API Key: $apikeyglobal
EOL

cd
cd

## Espera 30 segundos
wait_30_sec


msg_resumo_informacoes
## Dados da Aplicação:
echo -e "\e[32m🚀 [ EVOLUTION API INSTALADA COM SUCESSO ]\e[0m"
echo ""

echo -e "\e[97m🔗 Link do Manager:\e[33m https://$url_evolution/manager\e[0m"
echo ""

echo -e "\e[97m🌐 URL da API:\e[33m https://$url_evolution\e[0m"
echo ""

echo -e "\e[97m🔑 Chave de API Global:\e[33m $apikeyglobal\e[0m"
echo ""

msg_retorno_menu

}

ferramenta_pgvector() {

## Ativa a função dados para pegar os dados da vps
dados


## Gerando uma senha aleatória para o Postgres
senha_pgvector=$(openssl rand -hex 16)

## Criando a stack pgvector.yaml
cat > pgvector.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  pgvector:
    image: pgvector/pgvector:pg16 ## Versão do PgVector
    command: >
      postgres
      -c max_connections=500
      -c shared_buffers=512MB

    volumes:
      - pgvector:/var/lib/postgresql/data

    networks:
      - $nome_rede_interna ## Nome da rede interna

    ## Descomente as linhas abaixo para uso externo
    #ports:
    #  - 5433:5432

    environment:
      ## Senha do postgres 
      - POSTGRES_PASSWORD=$senha_pgvector

      ## Timezone
      - TZ=America/Sao_Paulo

    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      resources:
        limits:
          cpus: "1"
          memory: 1024M

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

volumes:
  pgvector:
    external: true
    name: pgvector

networks:
  $nome_rede_interna: ## Nome da rede interna
    external: true
    name: $nome_rede_interna ## Nome da rede interna
EOL
if [ $? -eq 0 ]; then
    echo "1/10 - [ OK ] - Criando Stack"
else
    echo "1/10 - [ OFF ] - Criando Stack"
    echo "Não foi possivel criar a stack do PgVector"
fi
STACK_NAME="pgvector"
stack_editavel 

cd dados_vps

cat > dados_pgvector <<EOL
[ PGVECTOR ]

Dominio do pgvector: postgres://pgvector:5432

Usuario: postgres

Senha: $senha_pgvector
EOL

cd
cd

## Espera 30 segundos
wait_stack "pgvector_pgvector"
sleep 30

echo ""
}

ferramenta_chatwoot() {


msg_chatwoot

## Ativa a função dados para pegar os dados da vps
dados


## Inicia um Loop até os dados estarem certos
while true; do

    ## Passo 1 - Domínio da aplicação
    echo -e "\e[97m📍 Passo$amarelo 1/6 - Configuração do Domínio\e[0m"
    echo -en "\e[33m🔗 Informe o domínio para o Chatwoot (ex: chatwoot.encha.ai): \e[0m" && read -r url_chatwoot
    echo ""

    ## Define o nome da empresa com base no nome do servidor
    nome_empresa_chatwoot="$nome_servidor"

    ## Passo 2 - Email SMTP
    echo -e "\e[97m📧 Passo$amarelo 2/6 - Email do Administrador\e[0m"
    echo -en "\e[33m📥 Digite o email que será usado para SMTP (ex: atendimento@encha.ai): \e[0m" && read -r email_admin_chatwoot
    echo ""

    ## Extrai domínio do SMTP
    dominio_smtp_chatwoot=$(echo "$email_admin_chatwoot" | cut -d "@" -f 2)

    ## Passo 3 - Usuário SMTP
    echo -e "\e[97m👤 Passo$amarelo 3/6 - Usuário SMTP\e[0m"
    echo -e "$amareloℹ️  Caso não tenha um usuário específico, use o próprio email acima.\e[0m"
    echo -en "\e[33m🧑‍💼 Digite o usuário do SMTP (ex: encha.ai ou atendimento@encha.ai): \e[0m" && read -r user_smtp_chatwoot
    echo ""

    ## Passo 4 - Senha do SMTP
    echo -e "\e[97m🔒 Passo$amarelo 4/6 - Senha SMTP\e[0m"
    echo -en "\e[33m🔑 Digite a senha SMTP do email (ex: @Senha123_): \e[0m" && read -r senha_email_chatwoot
    echo ""

    ## Passo 5 - Host SMTP
    echo -e "\e[97m🌐 Passo$amarelo 5/6 - Host SMTP\e[0m"
    echo -en "\e[33m🏠 Informe o Host SMTP do Email (ex: smtp.hostinger.com): \e[0m" && read -r smtp_email_chatwoot
    echo ""

    ## Passo 6 - Porta SMTP
    echo -e "\e[97m📦 Passo$amarelo 6/6 - Porta SMTP\e[0m"
    echo -en "\e[33m🔌 Digite a porta do SMTP (ex: 465): \e[0m" && read -r porta_smtp_chatwoot

    
    
    ## Verifica se a porta é 465, se sim deixa o ssl true, se não, deixa false 
    if [ "$porta_smtp_chatwoot" -eq 465 ]; then
     sobre_ssl=true
    else
     sobre_ssl=false
    fi
    
    ## Limpa o terminal
    clear
    
    
    
    ## Informação sobre URL
    echo ""
    echo -e "\e[32m📋 Resumo da Configuração do Chatwoot\e[0m"
    echo ""

    echo -e "\e[33m🌐 Domínio do Chatwoot:      \e[97m$url_chatwoot\e[0m"
    echo -e "\e[33m🏢 Nome da Empresa:         \e[97m$nome_empresa_chatwoot\e[0m"
    echo -e "\e[33m📧 Email SMTP:              \e[97m$email_admin_chatwoot\e[0m"
    echo -e "\e[33m👤 Usuário SMTP:            \e[97m$user_smtp_chatwoot\e[0m"
    echo -e "\e[33m🔑 Senha SMTP:              \e[97m$senha_email_chatwoot\e[0m"
    echo -e "\e[33m🖥️  Host SMTP:              \e[97m$smtp_email_chatwoot\e[0m"
    echo -e "\e[33m🔌 Porta SMTP:              \e[97m$porta_smtp_chatwoot\e[0m"
    echo ""


    ## Pergunta se as respostas estão corretas
    read -p $'\e[33mAs respostas estão corretas?\e[0m \e[32m(Y/N)\e[0m: ' confirmacao
    if [ "$confirmacao" = "Y" ] || [ "$confirmacao" = "y" ]; then

        ## Digitou Y para confirmar que as informações estão corretas

        ## Limpar o terminal
        clear

        ## Mostrar mensagem de Instalando
       

        ## Sai do Loop
        break
    else

        ## Digitou N para dizer que as informações não estão corretas.

        ## Limpar o terminal
        msg_chatwoot
        ## Mostra o nome da ferramenta
        

        ## Mostra mensagem para preencher informações
        

    ## Volta para o inicio do loop com as perguntas
    fi
done


## Mensagem de Passo
echo -e "\e[97m🚀 Iniciando a instalação do Chatwoot...\e[33m [Etapa 1 de 6]\e[0m"
echo ""
sleep 1


## Ativa a função dados para pegar os dados da vps
dados

## Mensagem de Passo
echo -e "\e[97m📦 Verificando ou instalando a extensão PGVector...\e[33m [Etapa 2 de 6]\e[0m"
echo ""
sleep 1

## Aqui vamos fazer uma verificação se já existe Postgres e redis instalado
## Se tiver ele vai criar um banco de dados no postgres ou perguntar se deseja apagar o que já existe e criar outro

## Verifica container postgres e cria banco no postgres
verificar_container_pgvector
if [ $? -eq 0 ]; then
    echo "✅ 1/3 - Postgres já instalado."
    pegar_senha_pgvector > /dev/null 2>&1
    echo "🔐 2/3 - Senha do PgVector copiada com sucesso."
    criar_banco_pgvector_da_stack "chatwoot${1:+_$1}"
    echo "🛠️ 3/3 - Banco de dados 'chatwoot${1:+_$1}' criado com sucesso."
    echo ""
else
    ferramenta_pgvector
    pegar_senha_pgvector > /dev/null 2>&1
    criar_banco_pgvector_da_stack "chatwoot${1:+_$1}"
fi

## Mensagem de Passo
echo -e "\e[97m⚙️ Instalando o Chatwoot...\e[33m [Etapa 3 de 6]\e[0m"
echo ""
sleep 1

## Neste passo vamos estar criando a Stack yaml do Chatwoot na pasta /root/
## Isso possibilitará que o usuario consiga edita-lo posteriormente

## Depois vamos instalar o Chatwoot e verificar se esta tudo certo.

## Criando key aleatória
encryption_key=$(openssl rand -hex 16)

## Criando a stack chatwoot.yaml
cat > chatwoot${1:+_$1}.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  chatwoot${1:+_$1}_app:
    image: chatwoot/chatwoot:v4.1.0 ## Versão do Chatwoot
    command: >
      sh -c "echo 'Rails.application.config.active_storage.variant_processor = :mini_magick' > /app/config/initializers/active_storage.rb && bundle exec rails s -p 3000 -b 0.0.0.0"
    entrypoint: docker/entrypoints/rails.sh

    volumes:
      - chatwoot${1:+_$1}_storage:/app/storage ## Arquivos de conversa
      - chatwoot${1:+_$1}_public:/app/public ## Arquivos de logos
      - chatwoot${1:+_$1}_mailer:/app/app/views/devise/mailer ## Arquivos de email
      - chatwoot${1:+_$1}_mailers:/app/app/views/mailers ## Arquivos de emails

    networks:
      - $nome_rede_interna ## Nome da rede interna
    
    environment:
      ## 🌐 Qualquer Url com # no final
      #- CHATWOOT_HUB_URL=https://encha.ai#

      ## 🏢 Nome da Empresa
      - INSTALLATION_NAME=$nome_empresa_chatwoot

      ## 🔐 Secret key
      - SECRET_KEY_BASE=$encryption_key

      ## 💬 Url Chatwoot
      - FRONTEND_URL=https://$url_chatwoot
      - FORCE_SSL=true

      ## 🌍 Idioma/Localização padrão
      - DEFAULT_LOCALE=pt_BR
      - TZ=America/Sao_Paulo

      ## ☁️ Google Cloud - Modifique de acordo com os seus dados
      #- GOOGLE_OAUTH_CLIENT_ID=369777777777-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
      #- GOOGLE_OAUTH_CLIENT_SECRET=ABCDEF-GHijklmnoPqrstuvwX-yz1234567
      #- GOOGLE_OAUTH_CALLBACK_URL=https://<your-server-domain>/omniauth/google_oauth2/callback

      ## 🧑‍💻 Dados do Redis
      - REDIS_URL=redis://chatwoot${1:+_$1}_redis:6379

      ## 🗄️ Dados do Postgres
      - POSTGRES_HOST=pgvector
      - POSTGRES_USERNAME=postgres
      - POSTGRES_PASSWORD=$senha_pgvector ## Senha do postgres
      - POSTGRES_DATABASE=chatwoot${1:+_$1}

      ## 🏠 Armazenamento
      - ACTIVE_STORAGE_SERVICE=local ## use s3_compatible para MinIO
      #- STORAGE_BUCKET_NAME=chatwoot${1:+_$1}
      #- STORAGE_ACCESS_KEY_ID=ACCESS_KEY_MINIO
      #- STORAGE_SECRET_ACCESS_KEY=SECRET_KEY_MINIO
      #- STORAGE_REGION=eu-south
      #- STORAGE_ENDPOINT=https://s3.DOMINIO.COM
      #- STORAGE_FORCE_PATH_STYLE=true

      ## 📧 Dados do SMTP
      - MAILER_SENDER_EMAIL=$email_admin_chatwoot <$email_admin_chatwoot> ## Email SMTP
      - SMTP_DOMAIN=$dominio_smtp_chatwoot ## Dominio do email
      - SMTP_ADDRESS=$smtp_email_chatwoot ## Host SMTP
      - SMTP_PORT=$porta_smtp_chatwoot ## Porta SMTP
      - SMTP_SSL=$sobre_ssl ## Se a porta for 465 = true | Se a porta for 587 = false
      - SMTP_USERNAME=$user_smtp_chatwoot ## Usuario SMTP
      - SMTP_PASSWORD=$senha_email_chatwoot ## Senha do SMTP
      - SMTP_AUTHENTICATION=login
      - SMTP_ENABLE_STARTTLS_AUTO=true
      - SMTP_OPENSSL_VERIFY_MODE=peer
      - MAILER_INBOUND_EMAIL_DOMAIN=$email_admin_chatwoot ## Email SMTP

      ## ⚙️ Melhorias
      - SIDEKIQ_CONCURRENCY=10
      - RACK_TIMEOUT_SERVICE_TIMEOUT=0
      - RAILS_MAX_THREADS=5
      - WEB_CONCURRENCY=2
      - ENABLE_RACK_ATTACK=false

      ## ⚡ Outras configurações
      - NODE_ENV=production
      - RAILS_ENV=production
      - INSTALLATION_ENV=docker
      - RAILS_LOG_TO_STDOUT=true
      - USE_INBOX_AVATAR_FOR_BOT=true
      - ENABLE_ACCOUNT_SIGNUP=false

    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      resources:
        limits:
          cpus: "1"
          memory: 1024M
      labels:
        - traefik.enable=true
        - traefik.http.routers.chatwoot${1:+_$1}_app.rule=Host(\`$url_chatwoot\`)
        - traefik.http.routers.chatwoot${1:+_$1}_app.entrypoints=websecure
        - traefik.http.routers.chatwoot${1:+_$1}_app.tls.certresolver=letsencryptresolver
        - traefik.http.routers.chatwoot${1:+_$1}_app.priority=1
        - traefik.http.routers.chatwoot${1:+_$1}_app.service=chatwoot${1:+_$1}_app
        - traefik.http.services.chatwoot${1:+_$1}_app.loadbalancer.server.port=3000
        - traefik.http.services.chatwoot${1:+_$1}_app.loadbalancer.passHostHeader=true
        - traefik.http.middlewares.sslheader.headers.customrequestheaders.X-Forwarded-Proto=https
        - traefik.http.routers.chatwoot${1:+_$1}_app.middlewares=sslheader

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  chatwoot${1:+_$1}_sidekiq:
    image: chatwoot/chatwoot:v4.1.0 ## Versão do Chatwoot
    command: bundle exec sidekiq -C config/sidekiq.yml

    volumes:
      - chatwoot${1:+_$1}_storage:/app/storage ## Arquivos de conversa
      - chatwoot${1:+_$1}_public:/app/public ## Arquivos de logos
      - chatwoot${1:+_$1}_mailer:/app/app/views/devise/mailer ## Arquivos de email
      - chatwoot${1:+_$1}_mailers:/app/app/views/mailers ## Arquivos de emails

    networks:
      - $nome_rede_interna ## Nome da rede interna

    environment:
      ## 🌐 Qualquer Url com # no final
      #- CHATWOOT_HUB_URL=https://encha.ai#

      ## 🏢 Nome da Empresa
      - INSTALLATION_NAME=$nome_empresa_chatwoot

      ## 🔐 Secret key
      - SECRET_KEY_BASE=$encryption_key

      ## 💬 Url Chatwoot
      - FRONTEND_URL=https://$url_chatwoot
      - FORCE_SSL=true

      ## 🌍 Idioma/Localização padrão
      - DEFAULT_LOCALE=pt_BR
      - TZ=America/Sao_Paulo

      ## ☁️ Google Cloud - Modifique de acordo com os seus dados
      #- GOOGLE_OAUTH_CLIENT_ID=369777777777-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
      #- GOOGLE_OAUTH_CLIENT_SECRET=ABCDEF-GHijklmnoPqrstuvwX-yz1234567
      #- GOOGLE_OAUTH_CALLBACK_URL=https://<your-server-domain>/omniauth/google_oauth2/callback

      ## 🧑‍💻 Dados do Redis
      - REDIS_URL=redis://chatwoot${1:+_$1}_redis:6379

      ## 🗄️ Dados do Postgres
      - POSTGRES_HOST=pgvector
      - POSTGRES_USERNAME=postgres
      - POSTGRES_PASSWORD=$senha_pgvector ## Senha do postgres
      - POSTGRES_DATABASE=chatwoot${1:+_$1}

      ## 🏠 Armazenamento
      - ACTIVE_STORAGE_SERVICE=local ## use s3_compatible para MinIO
      #- STORAGE_BUCKET_NAME=chatwoot${1:+_$1}
      #- STORAGE_ACCESS_KEY_ID=ACCESS_KEY_MINIO
      #- STORAGE_SECRET_ACCESS_KEY=SECRET_KEY_MINIO
      #- STORAGE_REGION=eu-south
      #- STORAGE_ENDPOINT=https://s3.DOMINIO.COM
      #- STORAGE_FORCE_PATH_STYLE=true

      ## 📧 Dados do SMTP
      - MAILER_SENDER_EMAIL=$email_admin_chatwoot <$email_admin_chatwoot> ## Email SMTP
      - SMTP_DOMAIN=$dominio_smtp_chatwoot ## Dominio do email
      - SMTP_ADDRESS=$smtp_email_chatwoot ## Host SMTP
      - SMTP_PORT=$porta_smtp_chatwoot ## Porta SMTP
      - SMTP_SSL=$sobre_ssl ## Se a porta for 465 = true | Se a porta for 587 = false
      - SMTP_USERNAME=$user_smtp_chatwoot ## Usuario SMTP
      - SMTP_PASSWORD=$senha_email_chatwoot ## Senha do SMTP
      - SMTP_AUTHENTICATION=login
      - SMTP_ENABLE_STARTTLS_AUTO=true
      - SMTP_OPENSSL_VERIFY_MODE=peer
      - MAILER_INBOUND_EMAIL_DOMAIN=$email_admin_chatwoot ## Email SMTP

      ## ⚙️ Melhorias
      - SIDEKIQ_CONCURRENCY=10
      - RACK_TIMEOUT_SERVICE_TIMEOUT=0
      - RAILS_MAX_THREADS=5
      - WEB_CONCURRENCY=2
      - ENABLE_RACK_ATTACK=false

      ## ⚡ Outras configurações
      - NODE_ENV=production
      - RAILS_ENV=production
      - INSTALLATION_ENV=docker
      - RAILS_LOG_TO_STDOUT=true
      - USE_INBOX_AVATAR_FOR_BOT=true
      - ENABLE_ACCOUNT_SIGNUP=false

    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      resources:
        limits:
          cpus: "1"
          memory: 1024M

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  chatwoot${1:+_$1}_redis:
    image: redis:latest  ## Versão do Redis
    command: [
        "redis-server",
        "--appendonly",
        "yes",
        "--port",
        "6379"
      ]

    volumes:
      - chatwoot${1:+_$1}_redis:/data

    networks:
      - $nome_rede_interna ## Nome da rede interna

    ## Descomente as linhas abaixo para uso externo
    #ports:
    #  - 6379:6379

    deploy:
      placement:
        constraints:
          - node.role == manager
      resources:
        limits:
          cpus: "1"
          memory: 2048M

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

volumes:
  chatwoot${1:+_$1}_storage:
    external: true
    name: chatwoot${1:+_$1}_storage
  chatwoot${1:+_$1}_public:
    external: true
    name: chatwoot${1:+_$1}_public
  chatwoot${1:+_$1}_mailer:
    external: true
    name: chatwoot${1:+_$1}_mailer
  chatwoot${1:+_$1}_mailers:
    external: true
    name: chatwoot${1:+_$1}_mailers
  volumes:
  chatwoot${1:+_$1}_redis:
    external: true
    name: chatwoot${1:+_$1}_redis

networks:
  $nome_rede_interna: ## Nome da rede interna
    external: true
    name: $nome_rede_interna ## Nome da rede interna
EOL
if [ $? -eq 0 ]; then
    echo "1/10 - [ OK ] - Criando Stack"
else
    echo "1/10 - [ OFF ] - Criando Stack"
    echo "Não foi possivel criar a stack do Chatwoot"
fi
STACK_NAME="chatwoot${1:+_$1}"
stack_editavel #> /dev/null 2>&1



## Mensagem de Passo
echo -e "\e[97m🔍 Verificando o serviço...\e[33m [Etapa 4 de 6]\e[0m"
echo ""
sleep 1

## Baixando imagens:
pull redis:latest chatwoot/chatwoot:v4.1.0

## Usa o serviço wait_chatwoot para verificar se o serviço esta online
wait_stack chatwoot${1:+_$1}_chatwoot${1:+_$1}_redis chatwoot${1:+_$1}_chatwoot${1:+_$1}_app chatwoot${1:+_$1}_chatwoot${1:+_$1}_sidekiq

sleep 30
echo ""
## Mensagem de Passo
echo -e "\e[97m🗄️ Migrando o banco de dados...\e[33m [Etapa 5 de 6]\e[0m"
echo ""
sleep 1

## Aqui vamos estar migrando o banco de dados usando o comando "bundle exec rails db:chatwoot_prepare"

## Basicamente voce poderia entrar no banco de dados do chatwoot e executar o comando por lá tambem

container_name="chatwoot${1:+_$1}_chatwoot${1:+_$1}_app"

max_wait_time=1200

wait_interval=60

elapsed_time=0

while [ $elapsed_time -lt $max_wait_time ]; do
  CONTAINER_ID=$(docker ps -q --filter "name=$container_name")
  if [ -n "$CONTAINER_ID" ]; then
    break
  fi
  sleep $wait_interval
  elapsed_time=$((elapsed_time + wait_interval))
done

if [ -z "$CONTAINER_ID" ]; then
  echo "⚠️ O contêiner não foi encontrado após aguardar $max_wait_time segundos."
  exit 1
fi

docker exec -it "$CONTAINER_ID" bundle exec rails db:chatwoot_prepare > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ 1/1 - [ OK ] - Comando executado no container: bundle exec rails db:chatwoot_prepare"
else
    echo "❌ 1/1 - [ FALHA ] - Comando executado no container: bundle exec rails db:chatwoot_prepare"
    echo "⚠️ Não foi possível migrar o banco de dados. Verifique os logs e tente novamente."
fi

echo ""
## Mensagem de Passo
echo -e "\e[97m🔑 Ativando funções do Super Admin...\e[33m [Etapa 6 de 6]\e[0m"
echo ""
sleep 1

##  Aqui vamos alterar um dado no postgres para liberar algumas funções ocultas no painel de super admin
wait_for_pgvector

docker exec -i $CONTAINER_ID psql -U postgres <<EOF > /dev/null 2>&1
\c chatwoot${1:+_$1};
update installation_configs set locked = false;
\q
EOF
if [ $? -eq 0 ]; then
    echo "1/1 - [ OK ] - Desbloqueando tabela installation_configs no pgvector"
else
    echo "❌ 1/1 - [ FALHA ] - Tentativa de desbloquear a tabela installation_configs no PgVector falhou."
    echo "⚠️ Não foi possível liberar as funções do Super Admin. Por favor, verifique os logs e tente novamente."
fi

echo ""



## Salvando informações da instalação dentro de /dados_vps/
cd dados_vps

cat > dados_chatwoot${1:+_$1} <<EOL
[ CHATWOOT ]

Dominio do Chatwoot: https://$url_chatwoot

Usuario: Precisa criar dentro do Chatwoot

Senha: Precisa criar dentro do Chatwoot
EOL

cd
cd

## Espera 30 segundos
wait_30_sec


msg_resumo_informacoes

## Dados da Aplicação:
echo -e "\e[32m🚀 [ CHATWOOT INSTALADO COM SUCESSO ]\e[0m"
echo ""

echo -e "\e[97m🌐 Domínio:\e[33m https://$url_chatwoot\e[0m"
echo ""

echo -e "\e[97m👤 Usuário:\e[33m Deve ser criado dentro do Chatwoot\e[0m"
echo ""

echo -e "\e[97m🔑 Senha:\e[33m Deve ser criada dentro do Chatwoot\e[0m"
echo ""

msg_retorno_menu

}

ferramenta_redis() {

## Ativa a função dados para pegar os dados da vps
dados



## Criando a stack do redis.yaml
cat > redis.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  redis:
    image: redis:latest  ## Versão do Redis
    command: [
        "redis-server",
        "--appendonly",
        "yes",
        "--port",
        "6379"
      ]

    volumes:
      - redis_data:/data

    networks:
      - $nome_rede_interna ## Nome da rede interna

    ## Descomente as linhas abaixo para uso externo
    #ports:
    #  - 6379:6379

    deploy:
      placement:
        constraints:
          - node.role == manager
      resources:
        limits:
          cpus: "1"
          memory: 2048M

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

volumes:
  redis_data:
    external: true
    name: redis_data

networks:
  $nome_rede_interna: ## Nome da rede interna
    external: true
    name: $nome_rede_interna ## Nome da rede interna
EOL
if [ $? -eq 0 ]; then
    echo "1/10 - [ OK ] - Criando Stack"
else
    echo "1/10 - [ OFF ] - Criando Stack"
    echo "Não foi possivel criar a stack do Redis"
fi
STACK_NAME="redis"
stack_editavel 

cd dados_vps

cat > dados_redis <<EOL
[ REDIS ]

Dominio do Redis: redis://redis:6379

Usuario: redis

EOL

cd
cd

## Espera 30 segundos
wait_stack "redis_redis"

echo ""
}

ferramenta_n8n() {

msg_n8n


## Ativa a função dados para pegar os dados da vps
dados

## Inicia um Loop até os dados estarem certos
while true; do

    ## Pergunta o domínio do N8N
    echo -e "\e[97mPasso$amarelo 1/7\e[0m"
    echo -en "\e[33m🌐 Informe o domínio para o N8N (ex: n8n.encha.ai): \e[0m" && read -r url_editorn8n
    echo ""

    ## Pergunta o domínio do Webhook
    echo -e "\e[97mPasso$amarelo 2/7\e[0m"
    echo -en "\e[33m🔗 Informe o domínio para o Webhook do N8N (ex: webhook.encha.ai): \e[0m" && read -r url_webhookn8n
    echo ""

    ## Pergunta o Email SMTP
    echo -e "\e[97mPasso$amarelo 3/7\e[0m"
    echo -en "\e[33m📧 Informe o Email para SMTP (ex: atendimento@encha.ai): \e[0m" && read -r email_smtp_n8n
    echo ""

    ## Pergunta o usuário do Email SMTP
    echo -e "\e[97mPasso$amarelo 4/7\e[0m"
    echo -e "$amarelo➡️ Caso não tenha um usuário separado, utilize o próprio email abaixo"
    echo -en "\e[33m👤 Informe o Usuário para SMTP (ex: encha ou atendimento@encha.ai): \e[0m" && read -r usuario_smtp_n8n
    echo ""

    ## Pergunta a senha do SMTP
    echo -e "\e[97mPasso$amarelo 5/7\e[0m"
    echo -en "\e[33m🔑 Informe a Senha SMTP do Email (ex: @Exemplo888_): \e[0m" && read -r senha_smtp_n8n
    echo ""

    ## Pergunta o Host SMTP do email
    echo -e "\e[97mPasso$amarelo 6/7\e[0m"
    echo -en "\e[33m🏠 Informe o Host SMTP do Email (ex: smtp.hostinger.com): \e[0m" && read -r host_smtp_n8n
    echo ""

    ## Pergunta a porta SMTP do email
    echo -e "\e[97mPasso$amarelo 7/7\e[0m"
    echo -en "\e[33m🔌 Informe a porta SMTP do Email (ex: 465): \e[0m" && read -r porta_smtp_n8n
    echo ""


    ## Verifica se a porta é 465, se sim deixa o ssl true, se não, deixa false 
    if [ "$porta_smtp_typebot" -eq 465 ]; then
    smtp_secure_smtp_n8n=true
    else
    smtp_secure_smtp_n8n=false
    fi
        
    ## Limpa o terminal
    clear
    
  
    
    echo ""
    echo -e "\e[32m📋 [ RESUMO - CONFIGURAÇÃO N8N ]\e[0m"
    echo ""

    echo -e "\e[33m🌐 Domínio do N8N:           \e[97m$url_editorn8n\e[0m"
    echo -e "\e[33m🔗 Domínio do Webhook:       \e[97m$url_webhookn8n\e[0m"
    echo -e "\e[33m📧 Email SMTP:               \e[97m$email_smtp_n8n\e[0m"
    echo -e "\e[33m👤 Usuário SMTP:             \e[97m$usuario_smtp_n8n\e[0m"
    echo -e "\e[33m🔑 Senha SMTP:               \e[97m$senha_smtp_n8n\e[0m"
    echo -e "\e[33m🖥️  Host SMTP:               \e[97m$host_smtp_n8n\e[0m"
    echo -e "\e[33m🔌 Porta SMTP:               \e[97m$porta_smtp_n8n\e[0m"
    echo ""

    
    read -p $'\e[33mAs respostas estão corretas?\e[0m \e[32m(Y/N)\e[0m: ' confirmacao
    if [ "$confirmacao" = "Y" ] || [ "$confirmacao" = "y" ]; then

        ## Digitou Y para confirmar que as informações estão corretas

        ## Limpar o terminal
        clear

        ## Mostrar mensagem de Instalando

        ## Sai do Loop
        break
    else

        ## Digitou N para dizer que as informações não estão corretas.
        
        ## Limpar o terminal
        msg_n8n


    fi
done

## Mensagem de Passo
echo -e "\e[97m🚀 Iniciando a instalação do N8N...\e[33m [Etapa 1 de 5]\e[0m"
echo ""
sleep 1


## NADA

## Mensagem de Passo
echo -e "\e[97m📦 Verificando ou instalando o Postgres...\e[33m [Etapa 2 de 5]\e[0m"
echo ""
sleep 1

## Verifica se tem postgres, se sim pega a senha e cria um banco nele, se não instala, pega a senha e cria o banco
verificar_container_postgres
if [ $? -eq 0 ]; then
    echo "✅ 1/3 - Postgres já está instalado."
    pegar_senha_postgres > /dev/null 2>&1
    echo "🔐 2/3 - Senha do Postgres copiada com sucesso."
    criar_banco_postgres_da_stack "n8n_queue${1:+_$1}"
    echo "🛠️  3/3 - Banco de dados 'n8n_queue${1:+_$1}' criado com sucesso."
    echo ""
else
    ferramenta_postgres
    pegar_senha_postgres > /dev/null 2>&1
    criar_banco_postgres_da_stack "n8n_queue${1:+_$1}"
fi

## Mensagem de Passo
echo -e "\e[97m📦 Verificando ou instalando o Redis...\e[33m [Etapa 3 de 5]\e[0m"
echo ""
sleep 1

## Verifica/instala o Redis
verificar_container_redis
if [ $? -eq 0 ]; then
    echo "✅ 1/1 - Redis já está instalado."
    echo ""
else
    ferramenta_redis
fi

## Mensagem de Passo
echo -e "\e[97m⚙️ Instalando o N8N...\e[33m [Etapa 4 de 5]\e[0m"
echo ""
sleep 1

## Criando key Aleatória
encryption_key=$(openssl rand -hex 16)

## Criando a stack n8n.yaml
cat > n8n${1:+_$1}.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  n8n${1:+_$1}_editor:
    image: n8nio/n8n:latest ## Versão do N8N
    command: start

    networks:
      - $nome_rede_interna ## Nome da rede interna

    environment:
      ## 🗄️ Banco de Dados (PostgreSQL)
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_DATABASE=n8n_queue${1:+_$1}
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_USER=postgres
      - DB_POSTGRESDB_PASSWORD=$senha_postgres

      ## 🔐 Criptografia
      - N8N_ENCRYPTION_KEY=$encryption_key

      ## 🌐 URLs e Configurações de Acesso
      - N8N_HOST=$url_editorn8n
      - N8N_EDITOR_BASE_URL=https://$url_editorn8n/
      - WEBHOOK_URL=https://$url_webhookn8n/
      - N8N_PROTOCOL=https

      ## ⚙️ Ambiente de Execução
      - NODE_ENV=production
      - EXECUTIONS_MODE=queue
      - EXECUTIONS_TIMEOUT=3600
      - EXECUTIONS_TIMEOUT_MAX=7200
      - OFFLOAD_MANUAL_EXECUTIONS_TO_WORKERS=true
      - N8N_RUNNERS_ENABLED=true
      - N8N_RUNNERS_MODE=internal

      ## 📦 Pacotes e Nós Comunitários
      - N8N_REINSTALL_MISSING_PACKAGES=true
      - N8N_COMMUNITY_PACKAGES_ENABLED=true
      - N8N_NODE_PATH=/home/node/.n8n/nodes
      - N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true

      ## 📧 SMTP (Envio de E-mails)
      - N8N_SMTP_SENDER=$email_smtp_n8n
      - N8N_SMTP_USER=$usuario_smtp_n8n
      - N8N_SMTP_PASS=$senha_smtp_n8n
      - N8N_SMTP_HOST=$host_smtp_n8n
      - N8N_SMTP_PORT=$porta_smtp_n8n
      - N8N_SMTP_SSL=$smtp_secure_smtp_n8n

      ## 🔁 Redis (Fila de Execução)
      - QUEUE_BULL_REDIS_HOST=redis
      - QUEUE_BULL_REDIS_PORT=6379
      - QUEUE_BULL_REDIS_DB=2

      ## 📊 Métricas
      - N8N_METRICS=true

      ## ⏱️ Execuções e Limpeza
      - EXECUTIONS_DATA_PRUNE=true
      - EXECUTIONS_DATA_MAX_AGE=336

      ## 🧠 Recursos de IA
      - N8N_AI_ENABLED=false
      - N8N_AI_PROVIDER=openai
      - N8N_AI_OPENAI_API_KEY=

      ## 🧰 Permissões em Funções Personalizadas
      - NODE_FUNCTION_ALLOW_BUILTIN=*
      - NODE_FUNCTION_ALLOW_EXTERNAL=moment,lodash

      ## 🕒 Fuso Horário
      - GENERIC_TIMEZONE=America/Sao_Paulo
      - TZ=America/Sao_Paulo

    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      resources:
        limits:
          cpus: "1"
          memory: 1024M
      labels:
        - traefik.enable=true
        - traefik.http.routers.n8n${1:+_$1}_editor.rule=Host(\`$url_editorn8n\`) ## Url do Editor do N8N
        - traefik.http.routers.n8n${1:+_$1}_editor.entrypoints=websecure
        - traefik.http.routers.n8n${1:+_$1}_editor.priority=1
        - traefik.http.routers.n8n${1:+_$1}_editor.tls.certresolver=letsencryptresolver
        - traefik.http.routers.n8n${1:+_$1}_editor.service=n8n${1:+_$1}_editor
        - traefik.http.services.n8n${1:+_$1}_editor.loadbalancer.server.port=5678
        - traefik.http.services.n8n${1:+_$1}_editor.loadbalancer.passHostHeader=1

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  n8n${1:+_$1}_webhook:
    image: n8nio/n8n:latest ## Versão do N8N
    command: webhook

    networks:
      - $nome_rede_interna ## Nome da rede interna

    environment:
      ## 🗄️ Banco de Dados (PostgreSQL)
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_DATABASE=n8n_queue${1:+_$1}
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_USER=postgres
      - DB_POSTGRESDB_PASSWORD=$senha_postgres

      ## 🔐 Criptografia
      - N8N_ENCRYPTION_KEY=$encryption_key

      ## 🌐 URLs e Configurações de Acesso
      - N8N_HOST=$url_editorn8n
      - N8N_EDITOR_BASE_URL=https://$url_editorn8n/
      - WEBHOOK_URL=https://$url_webhookn8n/
      - N8N_PROTOCOL=https

      ## ⚙️ Ambiente de Execução
      - NODE_ENV=production
      - EXECUTIONS_MODE=queue
      - EXECUTIONS_TIMEOUT=3600
      - EXECUTIONS_TIMEOUT_MAX=7200
      - OFFLOAD_MANUAL_EXECUTIONS_TO_WORKERS=true
      - N8N_RUNNERS_ENABLED=true
      - N8N_RUNNERS_MODE=internal

      ## 📦 Pacotes e Nós Comunitários
      - N8N_REINSTALL_MISSING_PACKAGES=true
      - N8N_COMMUNITY_PACKAGES_ENABLED=true
      - N8N_NODE_PATH=/home/node/.n8n/nodes
      - N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true

      ## 📧 SMTP (Envio de E-mails)
      - N8N_SMTP_SENDER=$email_smtp_n8n
      - N8N_SMTP_USER=$usuario_smtp_n8n
      - N8N_SMTP_PASS=$senha_smtp_n8n
      - N8N_SMTP_HOST=$host_smtp_n8n
      - N8N_SMTP_PORT=$porta_smtp_n8n
      - N8N_SMTP_SSL=$smtp_secure_smtp_n8n

      ## 🔁 Redis (Fila de Execução)
      - QUEUE_BULL_REDIS_HOST=redis
      - QUEUE_BULL_REDIS_PORT=6379
      - QUEUE_BULL_REDIS_DB=2

      ## 📊 Métricas
      - N8N_METRICS=true

      ## ⏱️ Execuções e Limpeza
      - EXECUTIONS_DATA_PRUNE=true
      - EXECUTIONS_DATA_MAX_AGE=336

      ## 🧠 Recursos de IA
      - N8N_AI_ENABLED=false
      - N8N_AI_PROVIDER=openai
      - N8N_AI_OPENAI_API_KEY=

      ## 🧰 Permissões em Funções Personalizadas
      - NODE_FUNCTION_ALLOW_BUILTIN=*
      - NODE_FUNCTION_ALLOW_EXTERNAL=moment,lodash

      ## 🕒 Fuso Horário
      - GENERIC_TIMEZONE=America/Sao_Paulo
      - TZ=America/Sao_Paulo
      
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      resources:
        limits:
          cpus: "1"
          memory: 1024M
      labels:
        - traefik.enable=true
        - traefik.http.routers.n8n${1:+_$1}_webhook.rule=(Host(\`$url_webhookn8n\`)) ## Url do Webhook do N8N
        - traefik.http.routers.n8n${1:+_$1}_webhook.entrypoints=websecure
        - traefik.http.routers.n8n${1:+_$1}_webhook.priority=1
        - traefik.http.routers.n8n${1:+_$1}_webhook.tls.certresolver=letsencryptresolver
        - traefik.http.routers.n8n${1:+_$1}_webhook.service=n8n${1:+_$1}_webhook
        - traefik.http.services.n8n${1:+_$1}_webhook.loadbalancer.server.port=5678
        - traefik.http.services.n8n${1:+_$1}_webhook.loadbalancer.passHostHeader=1

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  n8n${1:+_$1}_worker:
    image: n8nio/n8n:latest ## Versão do N8N
    command: worker --concurrency=10

    networks:
      - $nome_rede_interna ## Nome da rede interna

    environment:
      ## 🗄️ Banco de Dados (PostgreSQL)
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_DATABASE=n8n_queue${1:+_$1}
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_USER=postgres
      - DB_POSTGRESDB_PASSWORD=$senha_postgres

      ## 🔐 Criptografia
      - N8N_ENCRYPTION_KEY=$encryption_key

      ## 🌐 URLs e Configurações de Acesso
      - N8N_HOST=$url_editorn8n
      - N8N_EDITOR_BASE_URL=https://$url_editorn8n/
      - WEBHOOK_URL=https://$url_webhookn8n/
      - N8N_PROTOCOL=https

      ## ⚙️ Ambiente de Execução
      - NODE_ENV=production
      - EXECUTIONS_MODE=queue
      - EXECUTIONS_TIMEOUT=3600
      - EXECUTIONS_TIMEOUT_MAX=7200
      - OFFLOAD_MANUAL_EXECUTIONS_TO_WORKERS=true
      - N8N_RUNNERS_ENABLED=true
      - N8N_RUNNERS_MODE=internal

      ## 📦 Pacotes e Nós Comunitários
      - N8N_REINSTALL_MISSING_PACKAGES=true
      - N8N_COMMUNITY_PACKAGES_ENABLED=true
      - N8N_NODE_PATH=/home/node/.n8n/nodes
      - N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true

      ## 📧 SMTP (Envio de E-mails)
      - N8N_SMTP_SENDER=$email_smtp_n8n
      - N8N_SMTP_USER=$usuario_smtp_n8n
      - N8N_SMTP_PASS=$senha_smtp_n8n
      - N8N_SMTP_HOST=$host_smtp_n8n
      - N8N_SMTP_PORT=$porta_smtp_n8n
      - N8N_SMTP_SSL=$smtp_secure_smtp_n8n

      ## 🔁 Redis (Fila de Execução)
      - QUEUE_BULL_REDIS_HOST=redis
      - QUEUE_BULL_REDIS_PORT=6379
      - QUEUE_BULL_REDIS_DB=2

      ## 📊 Métricas
      - N8N_METRICS=true

      ## ⏱️ Execuções e Limpeza
      - EXECUTIONS_DATA_PRUNE=true
      - EXECUTIONS_DATA_MAX_AGE=336

      ## 🧠 Recursos de IA
      - N8N_AI_ENABLED=false
      - N8N_AI_PROVIDER=openai
      - N8N_AI_OPENAI_API_KEY=

      ## 🧰 Permissões em Funções Personalizadas
      - NODE_FUNCTION_ALLOW_BUILTIN=*
      - NODE_FUNCTION_ALLOW_EXTERNAL=moment,lodash

      ## 🕒 Fuso Horário
      - GENERIC_TIMEZONE=America/Sao_Paulo
      - TZ=America/Sao_Paulo
      
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      resources:
        limits:
          cpus: "1"
          memory: 1024M

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

networks:
  $nome_rede_interna: ## Nome da rede interna
    external: true
    name: $nome_rede_interna ## Nome da rede interna
EOL
if [ $? -eq 0 ]; then
    echo "1/10 - [ OK ] - Criando Stack"
else
    echo "1/10 - [ OFF ] - Criando Stack"
    echo "Não foi possivel criar a stack do N8N"
fi
STACK_NAME="n8n${1:+_$1}"
stack_editavel 

## Mensagem de Passo
echo -e "\e[97m🔍 Verificando o serviço...\e[33m [Etapa 5 de 5]\e[0m"
echo ""
sleep 1

## Baixando imagens:
pull n8nio/n8n:latest

## Usa o serviço wait_n8n para verificar se o serviço esta online
wait_stack n8n${1:+_$1}_n8n${1:+_$1}_editor n8n${1:+_$1}_n8n${1:+_$1}_webhook n8n${1:+_$1}_n8n${1:+_$1}_worker



cd dados_vps

cat > dados_n8n${1:+_$1} <<EOL
[ N8N ]

Dominio do N8N: https://$url_editorn8n

Dominio do Webhook do N8N: https://$url_webhookn8n

Email: Precisa criar no primeiro acesso do N8N

Senha: Precisa criar no primeiro acesso do N8N

EOL

cd
cd

## Espera 30 segundos
wait_30_sec

msg_resumo_informacoes

## Dados da Aplicação:
echo -e "\e[32m🚀 [ N8N INSTALADO COM SUCESSO ]\e[0m"
echo ""

echo -e "\e[33m🌐 Domínio do Editor:     \e[97mhttps://$url_editorn8n\e[0m"
echo -e "\e[33m🔗 Domínio do Webhook:    \e[97mhttps://$url_webhookn8n\e[0m"
echo -e "\e[33m👤 Email de Acesso:       \e[97mSerá criado no primeiro login do N8N\e[0m"
echo -e "\e[33m🔑 Senha de Acesso:       \e[97mSerá definida no primeiro login do N8N\e[0m"
echo ""

msg_retorno_menu

}

verificar_status_servicos() {
    msg_status
    echo -e "${azul}[📊] Status dos Serviços:${reset}"
    echo ""
    
    if docker info 2>/dev/null | grep -q "Swarm: active"; then
        echo -e "${verde}✅ Docker Swarm: Ativo${reset}"
        
        echo -e "${branco}Stacks instaladas:${reset}"
        docker stack ls 2>/dev/null || echo -e "${amarelo}Nenhuma stack encontrada${reset}"
        
        echo ""
        echo -e "${branco}Serviços em execução:${reset}"
        docker service ls 2>/dev/null || echo -e "${amarelo}Nenhum serviço encontrado${reset}"
    else
        echo -e "${vermelho}❌ Docker Swarm: Inativo${reset}"
    fi
}



exibir_menu() {
    while true; do
        clear
        banner
        echo -e "${branco}"
        centralizar "📋 === MENU PRINCIPAL ==="
        echo -e "${reset}"
        echo ""
        echo -e "${azul}01.${reset} Instalar Traefik + Portainer"
        echo -e "${azul}02.${reset} Instalar Evolution API"
        echo -e "${azul}03.${reset} Instalar N8N"
        echo -e "${azul}04.${reset} Instalar Chatwoot"
        echo -e "${azul}05.${reset} Verificar status dos serviços"
        echo -e "${azul}06.${reset} Sair"
        echo ""
        echo -en "${amarelo}👉 Escolha uma opção (1-6): ${reset}"
        read -r opcao

        case $opcao in
            01|1)
                verificar_stack "portainer${opcao2:+_$opcao2}" && continue || echo ""
                
                
                ferramenta_traefik_e_portainer
                
                
                
                ;;
            02|2)
                 verificar_stack "evolution${opcao2:+_$opcao2}" && continue || echo ""

                if verificar_docker_e_portainer_traefik; then
                    ## INICIO TOKEN
                    STACK_NAME="evolution${opcao2:+_$opcao2}"
                    if grep -q "Token: .\+" /root/dados_vps/dados_portainer; then
                        ferramenta_evolution "$opcao2"
                    else
                        APP_ENCHA="ferramenta_evolution"
                        verificar_arquivo
                    fi
                    ## FIM TOKEN 
                fi
                ;;

            03|3)
              verificar_stack "n8n${opcao2:+_$opcao2}" && continue || echo ""

              if verificar_docker_e_portainer_traefik; then
                  ## INICIO TOKEN
                  STACK_NAME="n8n${opcao2:+_$opcao2}"
                  if grep -q "Token: .\+" /root/dados_vps/dados_portainer; then
                      ferramenta_n8n "$opcao2"
                  else
                      APP_ENCHA="ferramenta_n8n"
                      verificar_arquivo
                  fi
                  ## FIM TOKEN
              fi
                ;; 
            04|4)
                verificar_stack "chatwoot${opcao2:+_$opcao2}" && continue || echo ""

                if verificar_docker_e_portainer_traefik; then
                    ## INICIO TOKEN
                    STACK_NAME="chatwoot${opcao2:+_$opcao2}"
                    if grep -q "Token: .\+" /root/dados_vps/dados_portainer; then
                        ferramenta_chatwoot "$opcao2"
                    else
                        APP_ENCHA="ferramenta_chatwoot"
                        verificar_arquivo
                    fi
                    ## FIM TOKEN 
                fi
                ;;
            05|5)
                verificar_status_servicos
                echo "Aperte ENTER para retornar ao menu de ferramentas"
                read
                sleep 2
                ;;    
            06|6)
                echo -e "${verde}Saindo...${reset}"
                clear
                exit 0
                ;;
            *)
                echo -e "${vermelho}Opção inválida! Tente novamente.${reset}"
                sleep 2
                ;;
        esac
    done
}




main() {
    exibir_menu
}

## Executar função principal se o script for chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
