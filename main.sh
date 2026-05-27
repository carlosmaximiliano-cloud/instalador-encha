
#!/bin/bash

# Quando executado via "curl | bash", stdin é o pipe — redireciona para o terminal
[[ -t 0 ]] || exec </dev/tty

# Cores melhoradas
roxo="\033[95m"
roxo_escuro="\033[35m"
amarelo="\033[93m"
amarelo_escuro="\033[33m"
verde="\033[92m"
verde_escuro="\033[32m"
vermelho="\033[91m"
vermelho_escuro="\033[31m"
azul="\033[94m"
azul_escuro="\033[34m"
ciano="\033[96m"
branco="\033[97m"
cinza="\033[90m"
negrito="\033[1m"
reset="\033[0m"

# Função para criar gradientes visuais
barra_gradiente() {
    echo -e "${roxo}╔═══════════════════════════════════════════════════════════════════════════════╗${reset}"
}

barra_final() {
    echo -e "${roxo}╚═══════════════════════════════════════════════════════════════════════════════╝${reset}"
}

barra_meio() {
    echo -e "${roxo}╠═══════════════════════════════════════════════════════════════════════════════╣${reset}"
}

# Função para animação de loading
loading_animation() {
    local duration=${1:-2}
    local chars="⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"
    local end_time=$((SECONDS + duration))
    
    while [ $SECONDS -lt $end_time ]; do
        for (( i=0; i<${#chars}; i++ )); do
            printf "\r${amarelo}%s Processando...${reset}" "${chars:$i:1}"
            sleep 0.1
        done
    done
    printf "\r${verde}✓ Concluído!         ${reset}\n"
}

centralizar() {
    local texto="$1"
    local largura_terminal=$(tput cols)
    local espacos=$(( (largura_terminal - ${#texto}) / 2 ))
    printf "%*s%s\n" "$espacos" "" "$texto"
}

# Banner principal melhorado
banner() {
    clear
    echo -e "${negrito}${roxo}"
    centralizar "╔══════════════════════════════════════════════════════════════════╗"
    centralizar "║                                                                  ║"
    centralizar "║   ███████ ███    ██  ██████ ██   ██  █████      █████  ██        ║"
    centralizar "║   ██      ████   ██ ██      ██   ██ ██   ██    ██   ██ ██        ║"
    centralizar "║   █████   ██ ██  ██ ██      ███████ ███████    ███████ ██        ║"
    centralizar "║   ██      ██  ██ ██ ██      ██   ██ ██   ██    ██   ██ ██        ║"
    centralizar "║   ███████ ██   ████  ██████ ██   ██ ██   ██ ██ ██   ██ ██        ║"
    centralizar "║                                                                  ║"
    centralizar "╚══════════════════════════════════════════════════════════════════╝"
    echo -e "${reset}"
    
    # Informações do sistema
    echo -e "${ciano}${negrito}"
    centralizar "INFORMAÇÕES DO SISTEMA"
    echo -e "${reset}"
    echo -e "${azul}   Sistema: ${verde}$(uname -s)${reset}"
    echo -e "${azul}   Kernel: ${verde}$(uname -r)${reset}"
    echo -e "${azul}   Arquitetura: ${verde}$(uname -m)${reset}"
    echo -e "${azul}   Uptime: ${verde}$(uptime -p 2>/dev/null || echo "N/A")${reset}"
    echo -e "${ciano}${negrito}"
    echo -e "${reset}"
    echo ""
    sleep 5
}

# Status melhorados com ícones
status_ok() { 
    echo -e "${verde}${negrito}✅ SUCCESS${reset} ${verde}│${reset} $1"
}

status_fail() { 
    echo -e "${vermelho}${negrito}❌ ERROR${reset} ${vermelho}│${reset} $1"
}

status_info() {
    echo -e "${azul}${negrito}ℹ️  INFO${reset} ${azul}│${reset} $1"
}

status_warning() {
    echo -e "${amarelo}${negrito}⚠️  WARNING${reset} ${amarelo}│${reset} $1"
}

# Logo animado do Encha AI
log_encha() {
    clear
    echo ""
    echo -e "${negrito}${roxo}"
    centralizar "               ╔══════════════════════════════════════════════════════════════════╗"
    centralizar "                                                                                "
    centralizar "                    ███████╗███╗   ██╗ ██████╗██╗  ██╗ █████╗     █████╗ ██╗    " 
    centralizar "                    ██╔════╝████╗  ██║██╔════╝██║  ██║██╔══██╗   ██╔══██╗██║    "
    centralizar "                    █████╗  ██╔██╗ ██║██║     ███████║███████║   ███████║██║    "
    centralizar "                    ██╔══╝  ██║╚██╗██║██║     ██╔══██║██╔══██║   ██╔══██║██║    " 
    centralizar "                    ███████╗██║ ╚████║╚██████╗██║  ██║██║  ██║██╗██║  ██║██║    "
    centralizar "                    ╚══════╝╚═╝  ╚═══╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═╝    "                    
    centralizar "                                                                                " 
    centralizar "                             🤖 Conectando você ao poder da IA                 "
    centralizar "               ║                                                                  ║"
    centralizar "               ╚══════════════════════════════════════════════════════════════════╝"
    echo -e "${reset}"
    echo ""
}


banner_agradecimento() {
    echo -e "${roxo}"
    centralizar " █████╗  ██████╗ ██████╗  █████╗ ██████╗ ███████╗ ██████╗██╗███╗   ███╗███████╗███╗   ██╗████████╗ ██████╗ ███████╗"
    centralizar "██╔══██╗██╔════╝ ██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝██║████╗ ████║██╔════╝████╗  ██║╚══██╔══╝██╔═══██╗██╔════╝"
    centralizar "███████║██║  ███╗██████╔╝███████║██║  ██║█████╗  ██║     ██║██╔████╔██║█████╗  ██╔██╗ ██║   ██║   ██║   ██║███████╗"
    centralizar "██╔══██║██║   ██║██╔══██╗██╔══██║██║  ██║██╔══╝  ██║     ██║██║╚██╔╝██║██╔══╝  ██║╚██╗██║   ██║   ██║   ██║╚════██║"
    centralizar "██║  ██║╚██████╔╝██║  ██║██║  ██║██████╔╝███████╗╚██████╗██║██║ ╚═╝ ██║███████╗██║ ╚████║   ██║   ╚██████╔╝███████║"
    centralizar "╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝ ╚═════╝╚═╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚══════╝"
    echo -e "${reset}"
    echo ""
}

aviso_legal(){
    clear
centralizar " █████╗ ██╗   ██╗██╗███████╗ ██████╗"
centralizar "██╔══██╗██║   ██║██║██╔════╝██╔═══██╗"
centralizar "███████║██║   ██║██║███████╗██║   ██║"
centralizar "██╔══██║╚██╗ ██╔╝██║╚════██║██║   ██║"
centralizar "██║  ██║ ╚████╔╝ ██║███████║╚██████╔╝"
centralizar "╚═╝  ╚═╝  ╚═══╝  ╚═╝╚══════╝ ╚═════╝"
    echo ""
    echo -e "${vermelho}${negrito}⚠ Aviso Legal:${reset}"
    echo -e "${amarelo}A Encha.ai disponibiliza esta ferramenta para auxiliar na instalação de ambientes de IA.${reset}"
    echo -e "${amarelo}O uso é de total responsabilidade do usuário. Não nos responsabilizamos por danos, configurações, conteúdos ou usos indevidos.${reset}"
    echo ""

    while true; do
        echo -en "${ciano}Você aceita seguir com total responsabilidade pelo uso da ferramenta? (Y/N): ${reset}"
        read -r confirmacao </dev/tty

        case "$confirmacao" in
            [Yy])
                echo -e "${verde}✔ Termos aceitos. um momento...${reset}"
                sleep 2

                # Seção de agradecimentos
                clear
                banner_agradecimento
                echo ""

                echo -e "${amarelo}==================================================================================================
Este auto-instalador foi desenvolvido para auxiliar na instalação das principais aplicações
disponíveis no mercado open source. Os créditos originais de cada aplicação pertencem
aos respectivos desenvolvedores.
Este script foi criado originalmente pela ${ciano}OrionDesign${amarelo} (contato@oriondesign.art.br | https://oriondesign.art.br/setup)
e posteriormente refatorado pela ${verde}Encha AI${amarelo} (instalador@encha.ai | https://encha.ai), uma ferramenta
de IA para automação de tarefas e otimização de processos.
Este Setup é licenciado sob a Licença MIT Modificada. Você pode usar, copiar, modificar,
integrar, publicar, distribuir e/ou vender cópias dos produtos finais, desde que mantenha
este aviso e declare, de forma visível, que ${ciano}OrionDesign${amarelo} é o autor original e que foi refatorado
pela ${verde}Encha AI${amarelo}, incluindo os links para https://oriondesign.art.br/setup e https://encha.ai.
==================================================================================================${reset}"
                
                echo ""
                echo ""
                echo -e "${ciano}Prosseguindo com a instalação em 5 segundos...${reset}"
                sleep 5
                break
                ;;
            [Nn])
                echo -e "${vermelho}✖ Instalação cancelada pelo usuário.${reset}"
                exit 1
                ;;
            *)
                echo -e "${amarelo}Por favor, responda com 'Y' para sim ou 'N' para não.${reset}"
                ;;
        esac
    done
}


# Função para mostrar progresso
mostrar_progresso() {
    local atual=$1
    local total=$2
    local descricao=$3
    local porcentagem=$((atual * 100 / total))
    local preenchido=$((porcentagem / 5))
    local vazio=$((20 - preenchido))
    
    printf "\r${azul}${negrito}[${reset}"
    printf "${verde}%*s${reset}" $preenchido | tr ' ' '█'
    printf "${cinza}%*s${reset}" $vazio | tr ' ' '░'
    printf "${azul}${negrito}]${reset} ${branco}%d%%${reset} ${amarelo}%s${reset}" $porcentagem "$descricao"
}

obter_ip_publico() {
    status_info "Obtendo o IP público do servidor..."
    ip_publico=$(curl -s --max-time 10 https://icanhazip.com || hostname -I | awk '{print $1}')
    if [ -n "$ip_publico" ]; then
        status_ok "IP público identificado com sucesso: ${negrito}$ip_publico${reset}"
    else
        status_warning "Falha ao obter IP público. Será usado o IP local como alternativa."
        ip_publico=$(hostname -I | awk '{print $1}')
    fi
    echo "$ip_publico"
}

executar_instalacoes() {
    echo ""
    barra_meio
    echo -e "${verde}${negrito}📦 Iniciando a instalação dos pacotes necessários...${reset}"
    barra_meio
    
    pacotes=(sudo apt-utils dialog jq apache2-utils git python3 neofetch curl wget htop vim nano)
    total_pacotes=${#pacotes[@]}

    for i in "${!pacotes[@]}"; do
        pacote="${pacotes[$i]}"
        atual=$((i + 1))
        
        mostrar_progresso $atual $total_pacotes "Instalando $pacote..."
        
        DEBIAN_FRONTEND=noninteractive apt-get install -y "$pacote" > /dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            printf "\n"
            status_ok "[$atual/$total_pacotes] $pacote instalado com sucesso"
        else
            printf "\n"
            status_fail "[$atual/$total_pacotes] Falha na instalação de $pacote"
        fi
    done
    
    echo ""
    status_ok "Instalação de pacotes concluída! 📋"
}

# Função para verificar e exibir recursos do sistema
mostrar_recursos() {
    echo ""
    barra_meio
    echo -e "${ciano}${negrito}💻 RECURSOS DO SISTEMA${reset}"
    barra_meio
    
    echo -e "${azul}RAM Total:${reset} ${verde}$(free -h | awk '/^Mem:/ {print $2}')${reset}"
    echo -e "${azul}RAM Livre:${reset} ${verde}$(free -h | awk '/^Mem:/ {print $7}')${reset}"
    echo -e "${azul}Espaço em Disco:${reset} ${verde}$(df -h / | awk 'NR==2 {print $4}') livre de $(df -h / | awk 'NR==2 {print $2}')${reset}"
    echo -e "${azul}CPU:${reset} ${verde}$(nproc) núcleos${reset}"
    echo -e "${azul}Load Average:${reset} ${verde}$(uptime | awk -F'load average:' '{print $2}')${reset}"
}

# ====== INÍCIO DO SCRIPT PRINCIPAL ======
clear
aviso_legal
banner
log_encha

sleep 2

echo -e "${amarelo}${negrito}🚀 Iniciando processo de configuração...${reset}"
sleep 1

# Verificação de privilégios
if [ "$(id -u)" -ne 0 ]; then
    echo ""
    status_fail "Este script deve ser executado como root!"
    echo -e "${amarelo}Execute: ${negrito}sudo $0${reset}"
    exit 1
fi

# Mudar para diretório root
cd /root || { 
    status_fail "Erro ao acessar diretório /root"
    exit 1
}

mostrar_recursos

# Update inicial do sistema
echo ""
barra_meio
echo -e "${amarelo}${negrito}🔄 ATUALIZAÇÃO DO SISTEMA${reset}"
barra_meio

status_info "Atualizando lista de pacotes..."
DEBIAN_FRONTEND=noninteractive apt update > /dev/null 2>&1 && status_ok "Lista de pacotes atualizada"

status_info "Atualizando pacotes do sistema..."
echo -e "${amarelo}${negrito}⚠ O processo pode demorar um pouco. Agradecemos a sua paciência.${reset}"
DEBIAN_FRONTEND=noninteractive apt upgrade -y > /dev/null 2>&1 && status_ok "Sistema atualizado com sucesso"

# Executar instalações
executar_instalacoes


# ─────────────────────────────────────────────────────────────────────────────
# FLUXO LINEAR — instala Traefik+Portainer + Encha Setup Panel automaticamente
# ─────────────────────────────────────────────────────────────────────────────

banner_instalacao_completa() {
    clear
    echo -e "${negrito}${roxo}"
    centralizar "╔══════════════════════════════════════════════════════════════════╗"
    centralizar "║          🚀 INSTALAÇÃO AUTOMÁTICA DO ENCHA SETUP                 ║"
    centralizar "╚══════════════════════════════════════════════════════════════════╝"
    echo -e "${reset}"
    echo ""
    echo -e "${ciano}Serão instalados nesta sequência:${reset}"
    echo -e "  ${verde}1.${reset} Docker Swarm + rede overlay"
    echo -e "  ${verde}2.${reset} Traefik (proxy reverso com SSL automático)"
    echo -e "  ${verde}3.${reset} Portainer (interface de gerenciamento Docker)"
    echo -e "  ${verde}4.${reset} Encha Setup Panel (painel visual para instalar stacks)"
    echo ""
    echo -e "${amarelo}⚠ Aponte os subdomínios para o IP da VPS ANTES de continuar:${reset}"
    echo -e "  • portainer.seudominio.com  →  IP_DA_VPS"
    echo -e "  • painel.seudominio.com     →  IP_DA_VPS"
    echo ""
    echo -ne "${ciano}Pressione ENTER para iniciar...${reset}" && read -r _ </dev/tty
}

coletar_inputs_instalacao() {
    clear
    echo -e "${negrito}${roxo}📝 COLETA DE DADOS${reset}"
    echo ""

    # 1) Subdomínio Portainer
    while true; do
        echo -ne "${ciano}1/5 Subdomínio do Portainer (ex: portainer.encha.ai): ${reset}" && read -r url_portainer </dev/tty
        [[ "$url_portainer" =~ ^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$ ]] && break
        echo -e "${vermelho}✖ Domínio inválido.${reset}"
    done

    # 2) Usuário Portainer
    while true; do
        echo -ne "${ciano}2/5 Usuário admin do Portainer: ${reset}" && read -r user_portainer </dev/tty
        [[ ${#user_portainer} -ge 3 ]] && break
        echo -e "${vermelho}✖ Mínimo 3 caracteres.${reset}"
    done

    # 3) Senha Portainer (12+ chars, maiús, minús, dígito, especial)
    while true; do
        echo -e "${amarelo}--> Mínimo 12 caracteres com MAIÚSCULAS, minúsculas, números e @ ou _${reset}"
        echo -ne "${ciano}3/5 Senha do Portainer: ${reset}" && read -r pass_portainer </dev/tty
        if [[ ${#pass_portainer} -ge 12 ]] \
            && [[ "$pass_portainer" =~ [A-Z] ]] \
            && [[ "$pass_portainer" =~ [a-z] ]] \
            && [[ "$pass_portainer" =~ [0-9] ]] \
            && [[ "$pass_portainer" =~ [@_] ]]; then
            break
        fi
        echo -e "${vermelho}✖ Senha não atende aos requisitos.${reset}"
    done

    # 4) Email SSL
    while true; do
        echo -ne "${ciano}4/5 Email para certificados SSL (Let's Encrypt): ${reset}" && read -r email_ssl </dev/tty
        [[ "$email_ssl" =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]] && break
        echo -e "${vermelho}✖ Email inválido.${reset}"
    done

    # 5) Subdomínio do Painel
    while true; do
        echo -ne "${ciano}5/5 Subdomínio do Encha Setup Panel (ex: painel.encha.ai): ${reset}" && read -r url_painel </dev/tty
        [[ "$url_painel" =~ ^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$ ]] && break
        echo -e "${vermelho}✖ Domínio inválido.${reset}"
    done

    # Defaults fixos (combinam com docker-stack.yaml do painel)
    nome_servidor="encha"
    nome_rede_interna="enchanet"

    # Confirmação
    clear
    echo -e "${roxo}${negrito}🔍 CONFIRA OS DADOS:${reset}"
    echo -e "  ${azul}Portainer:${reset}  https://${verde}${url_portainer}${reset}"
    echo -e "  ${azul}Usuário:${reset}    ${verde}${user_portainer}${reset}"
    echo -e "  ${azul}Email SSL:${reset}  ${verde}${email_ssl}${reset}"
    echo -e "  ${azul}Painel:${reset}     https://${verde}${url_painel}${reset}"
    echo ""
    while true; do
        echo -ne "${verde}✅ Confirma? (Y/N): ${reset}" && read -r confirmacao </dev/tty
        case "$confirmacao" in
            [Yy]) break ;;
            [Nn]) coletar_inputs_instalacao; return ;;
            *)   echo -e "${amarelo}Responda Y ou N.${reset}" ;;
        esac
    done

    export url_portainer user_portainer pass_portainer email_ssl url_painel
    export nome_servidor nome_rede_interna
    export ENCHA_NONINTERACTIVE=1
    export ENCHA_MAX_RETRIES=10
    export ENCHA_SLEEP=60
}

download_secondary() {
    echo ""
    barra_meio
    echo -e "${roxo}${negrito}📥 BAIXANDO SCRIPT DE INSTALAÇÃO${reset}"
    barra_meio

    [ -f SetupEnchaAI ] && rm -f SetupEnchaAI

    status_info "Baixando secondary.sh da fonte oficial..."
    if curl -fsSL --retry 3 --connect-timeout 10 \
        https://raw.githubusercontent.com/Encha-Ai/Instalador-Encha/main/secondary.sh \
        -o SetupEnchaAI; then
        chmod +x SetupEnchaAI
        status_ok "Script baixado com sucesso"
    else
        status_fail "Falha no download. Verifique a conexão."
        exit 1
    fi
}

mostrar_resumo_final() {
    clear
    echo -e "${negrito}${verde}"
    centralizar "╔══════════════════════════════════════════════════════════════════╗"
    centralizar "║                                                                  ║"
    centralizar "║                  🎉 INSTALAÇÃO CONCLUÍDA! 🎉                    ║"
    centralizar "║                                                                  ║"
    centralizar "╚══════════════════════════════════════════════════════════════════╝"
    echo -e "${reset}"
    echo ""
    echo -e "${ciano}${negrito}Acesse seus serviços:${reset}"
    echo -e "  ${verde}▸ Portainer:${reset}  https://${negrito}${url_portainer}${reset}"
    echo -e "    ${cinza}usuário: ${user_portainer}${reset}"
    echo -e "  ${verde}▸ Painel Encha:${reset} https://${negrito}${url_painel}${reset}"
    echo ""
    echo -e "${amarelo}💡 O Encha Setup Panel já está pronto para instalar as demais stacks.${reset}"
    echo ""
    echo -e "${ciano}${negrito}Suporte:${reset}"
    echo -e "  ${azul}📧 atendimento@encha.ai${reset}"
    echo -e "  ${azul}🌐 https://encha.ai${reset}"
    echo -e "  ${azul}📱 WhatsApp: +55 61 99159-2205${reset}"
    echo ""
}

# ───────── EXECUÇÃO ─────────

banner_instalacao_completa
coletar_inputs_instalacao
download_secondary

status_info "Carregando funções do instalador..."
# shellcheck source=/dev/null
source ./SetupEnchaAI
status_ok "Funções carregadas (modo biblioteca)"

echo ""
barra_meio
echo -e "${roxo}${negrito}🐳 INSTALANDO TRAEFIK + PORTAINER${reset}"
barra_meio
ferramenta_traefik_e_portainer

echo ""
barra_meio
echo -e "${roxo}${negrito}📦 INSTALANDO ENCHA SETUP PANEL${reset}"
barra_meio
ferramenta_encha_panel

mostrar_resumo_final
echo ""
