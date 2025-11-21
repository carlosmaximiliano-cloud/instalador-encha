ferramenta_traefik_e_portainer() {

  msg_traefik_portainer
while true; do

    echo -e "Passo \e[33m1/6\e[0m 📡"
    echo -ne "\e[36mDigite o domínio para o Portainer (ex: portainer.encha.ai): \e[0m" && read -r url_portainer
    echo ""

    echo -e "\e[97mPasso\e[33m 2/6\e[0m 👤"
    echo -en "\e[33mDigite um usuário para o Portainer (ex: admin): \e[0m" && read -r user_portainer
    echo ""

    while true; do
        echo -e "Passo \e[33m3/6\e[0m 🔐"
        echo -e "\e[33m--> Mínimo 12 caracteres. Use letras MAIÚSCULAS e minúsculas, números e um caractere especial @ ou _\e[0m"
        echo -e "\e[33m--> Evite caracteres especiais como: \\!#$\e[0m"
        echo -ne "\e[36mDigite uma senha para o Portainer (ex: Porta@12345_): \e[0m" && read -r pass_portainer
        echo ""

        if validar_senha "$pass_portainer" 12; then
            break
        fi
        echo ""
    done

    echo -e "Passo \e[33m4/6\e[0m 🖥️"
    echo -e "\e[33m--> Não pode conter espaços e/ou caracteres especiais.\e[0m"
    echo -ne "\e[36mEscolha um nome para o seu servidor (ex: encha): \e[0m" && read -r nome_servidor
    echo ""

    echo -e "Passo \e[33m5/6\e[0m 🌐"
    echo -e "\e[33m--> Não pode conter espaços e/ou caracteres especiais.\e[0m"
    echo -ne "\e[36mDigite um nome para sua rede interna (ex: enchaNet): \e[0m" && read -r nome_rede_interna
    echo ""

    echo -e "Passo \e[33m6/6\e[0m 📧"
    echo -ne "\e[36mDigite um endereço de email válido (ex: instalador@encha.ai): \e[0m" && read -r email_ssl
    echo ""

    clear
    msg_traefik_portainer
    echo ""
    echo -e "\e[33m🔍 Por favor, revise as informações abaixo:\e[0m\n"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "\e[33m🔗 Link do Portainer:\e[97m $url_portainer\e[0m\n"
    echo -e "\e[33m👤 Usuário do Portainer:\e[97m $user_portainer\e[0m\n"
    echo -e "\e[33m🔒 Senha do Portainer:\e[97m $pass_portainer\e[0m\n"
    echo -e "\e[33m🖥️ Nome do Servidor:\e[97m $nome_servidor\e[0m\n"
    echo -e "\e[33m🌐 Rede interna:\e[97m $nome_rede_interna\e[0m\n"
    echo -e "\e[33m📧 Email:\e[97m $email_ssl\e[0m\n"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    read -p $'\e[32m✅ As respostas estão corretas?\e[0m \e[33m(Y/N)\e[0m: ' confirmacao
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
  echo -e "Passo \e[33m2/9\e[0m ⚙️"
  echo -e "\e[33m--> Atualizando e configurando a VPS...\e[0m\n"
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
          echo -e "Passo \e[33m3/3\e[0m - [\e[32mOK\e[0m] ✅ Swarm iniciado com sucesso"
          break
      else
          echo -e "Passo \e[33m3/3\e[0m ❌ [\e[31mFALHOU\e[0m] - Falha ao iniciar o Swarm"
          echo -e "\e[33mOps! Não foi possível iniciar o Swarm. Tentativa \e[36m$attempt\e[33m de \e[36m$max_attempts\e[33m...\e[0m"
          attempt=$((attempt + 1))
          sleep 5
      fi
  done

  if [ $attempt -gt $max_attempts ]; then
      echo -e "❌ \e[31mNão foi possível iniciar o Swarm após \e[33m$max_attempts\e[31m tentativas...\e[0m"
      echo -e "⚠️ \e[33mRecomendo formatar a VPS e tentar novamente.\e[0m"
      echo -e "ℹ️ \e[33mLembre-se: o primeiro requisito é usar uma VPS vazia.\e[0m"
      sleep 10
      exit 1
  fi

  echo ""

 

  echo -e "🔗 \e[97mCriando rede interna \e[33m[4/9]\e[0m\n"
  sleep 1

  sudo docker network create --driver=overlay "$nome_rede_interna" > /dev/null 2>&1
  if [ $? -eq 0 ]; then
      echo -e "Passo \e[33m1/1\e[0m ✅ - Rede interna configurada com sucesso"
  else
      echo -e "Passo \e[33m1/1\e[0m ❌ [\e[31mFALHOU\e[0m] - Falha ao configurar a rede interna"
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
    echo -e "Passo \e[33m1/2\e[0m ✅ - Stack criada com sucesso"
  else
    echo -e "Passo \e[33m1/2\e[0m ❌ [\e[31mFALHOU\e[0m] - Falha ao criar a stack do Traefik"
    echo -e "⚠️ \e[33mOps, não foi possível criar a stack do Traefik.\e[0m"
  fi


  sudo docker stack deploy --prune --resolve-image always -c traefik.yaml traefik > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo -e "Passo \e[33m2/2\e[0m ✅ - Stack deployada com sucesso"
  else
    echo -e "Passo \e[33m2/2\e[0m ❌ [\e[31mFALHOU\e[0m] - Falha ao realizar o deploy da stack"
    echo -e "⚠️ \e[33mOps, não foi possível subir o Traefik.\e[0m"
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
    echo -e "Passo \e[33m1/2\e[0m ✅ - Stack criada com sucesso"
  else
    echo -e "Passo \e[33m1/2\e[0m ❌ [\e[31mFALHOU\e[0m] - Falha ao criar a stack do Portainer"
    echo -e "⚠️ \e[33mOps, não foi possível criar a stack do Portainer.\e[0m"
  fi


  sudo docker stack deploy --prune --resolve-image always -c portainer.yaml portainer > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo -e "Passo \e[33m2/2\e[0m ✅ - Stack deployada com sucesso"
  else
    echo -e "Passo \e[33m2/2\e[0m ❌ [\e[31mFALHOU\e[0m] - Falha ao fazer o deploy da stack"
    echo -e "⚠️ \e[33mOps, não foi possível subir a stack do Portainer.\e[0m"
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
      echo -e "❌ [\e[31mFALHOU\e[0m] - Não foi possível criar a conta de administrador após \e[33m$MAX_RETRIES\e[0m tentativas."
      echo -e "⚠️ Erro retornado: \e[31m$RESPONSE\e[0m"
      echo -e "ℹ️ \e[33mApós a conclusão da instalação, por favor, crie uma conta acessando o link do seu Portainer.\e[0m"
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
    echo -e "Passo \e[33m2/2\e[0m ✅ - Primeiro token gerado com sucesso"
  else
    echo -e "Passo \e[33m2/2\e[0m ❌ [\e[31mFALHOU\e[0m] - Falha ao gerar o token"
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

echo -e "🚀 \e[32m[ PORTAINER INSTALADO COM SUCESSO ]\e[0m\n"

echo -e "\e[33m🔗 Domínio do Portainer:\e[97m https://$url_portainer\e[0m\n"

if [ "$CONTA_CRIADA" = true ]; then
  echo -e "\e[33m👤 Usuário:\e[97m $user_portainer\e[0m\n"
  echo -e "\e[33m🔒 Senha:\e[97m $pass_portainer\e[0m\n"
else
  echo -e "\e[33m👤 Usuário:\e[31m Precisa criar dentro do Portainer\e[0m\n"
  echo -e "\e[33m🔒 Senha:\e[31m Precisa criar dentro do Portainer\e[0m\n"
  echo -e "\e[33m⚠️ Observação:\e[97m Você tem menos de 5 minutos para criar uma conta no Portainer.\e[0m"
fi
echo -e "\e[33m🖥️ Nome do Servidor:\e[97m $nome_servidor\e[0m\n"

msg_retorno_menu


}