
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

msg_n8n_formacao_encha(){
  clear
      echo -e "${roxo}"
centralizar "███╗   ██╗ █████╗ ███╗   ██╗"                                         
centralizar "████╗  ██║██╔══██╗████╗  ██║"                                         
centralizar "██╔██╗ ██║╚█████╔╝██╔██╗ ██║"                                         
centralizar "██║╚██╗██║██╔══██╗██║╚██╗██║"                                         
centralizar "██║ ╚████║╚█████╔╝██║ ╚████║"                                         
centralizar "╚═╝  ╚═══╝ ╚════╝ ╚═╝  ╚═══╝"                                                                      
centralizar "███████╗ ██████╗ ██████╗ ███╗   ███╗ █████╗  ██████╗ █████╗  ██████╗" 
centralizar "██╔════╝██╔═══██╗██╔══██╗████╗ ████║██╔══██╗██╔════╝██╔══██╗██╔═══██╗"
centralizar "█████╗  ██║   ██║██████╔╝██╔████╔██║███████║██║     ███████║██║   ██║"
centralizar "██╔══╝  ██║   ██║██╔══██╗██║╚██╔╝██║██╔══██║██║     ██╔══██║██║   ██║"
centralizar "██║     ╚██████╔╝██║  ██║██║ ╚═╝ ██║██║  ██║╚██████╗██║  ██║╚██████╔╝"
centralizar "╚═╝      ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝ ╚═════╝ "                                                                    
centralizar "███████╗███╗   ██╗ ██████╗██╗  ██╗ █████╗"                            
centralizar "██╔════╝████╗  ██║██╔════╝██║  ██║██╔══██╗"                           
centralizar "█████╗  ██╔██╗ ██║██║     ███████║███████║"                          
centralizar "██╔══╝  ██║╚██╗██║██║     ██╔══██║██╔══██║"                           
centralizar "███████╗██║ ╚████║╚██████╗██║  ██║██║  ██║"                           
centralizar "╚══════╝╚═╝  ╚═══╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝"                           
      echo -e "${reset}"
      echo ""
}

msg_chatwoot(){
  clear
      echo -e "${roxo}"
centralizar "██████╗ ██╗  ██╗ █████╗ ████████╗██╗    ██╗ ██████╗  ██████╗ ████████╗"
centralizar "██╔════╝██║  ██║██╔══██╗╚══██╔══╝██║    ██║██╔═══██╗██╔═══██╗╚══██╔══╝"
centralizar "██║     ███████║███████║   ██║   ██║ █╗ ██║██║   ██║██║   ██║   ██║"  
centralizar "██║     ██╔══██║██╔══██║   ██║   ██║███╗██║██║   ██║██║   ██║   ██║"   
centralizar "╚██████╗██║  ██║██║  ██║   ██║   ╚███╔███╔╝╚██████╔╝╚██████╔╝   ██║"   
centralizar "╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝    ╚══╝╚══╝  ╚═════╝  ╚═════╝    ╚═╝"   
      echo -e "${reset}"
      echo ""
}

msg_minio(){
  clear
      echo -e "${roxo}"
centralizar "███╗   ███╗██╗███╗   ██╗██╗ ██████╗" 
centralizar "████╗ ████║██║████╗  ██║██║██╔═══██╗"
centralizar "██╔████╔██║██║██╔██╗ ██║██║██║   ██║"
centralizar "██║╚██╔╝██║██║██║╚██╗██║██║██║   ██║"
centralizar "██║ ╚═╝ ██║██║██║ ╚████║██║╚██████╔╝"
centralizar "╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝ ╚═════╝" 
      echo -e "${reset}"
      echo ""
}

msg_typebot(){
  clear
      echo -e "${roxo}"
centralizar "████████╗██╗   ██╗██████╗ ███████╗██████╗  ██████╗ ████████╗"
centralizar "╚══██╔══╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗██╔═══██╗╚══██╔══╝"
centralizar "   ██║    ╚████╔╝ ██████╔╝█████╗  ██████╔╝██║   ██║   ██║"   
centralizar "   ██║     ╚██╔╝  ██╔═══╝ ██╔══╝  ██╔══██╗██║   ██║   ██║"   
centralizar "   ██║      ██║   ██║     ███████╗██████╔╝╚██████╔╝   ██║"   
centralizar "   ╚═╝      ╚═╝   ╚═╝     ╚══════╝╚═════╝  ╚═════╝    ╚═╝"            
      echo -e "${reset}"
      echo ""
}

msg_directus(){
  clear
    echo -e "${roxo}"
centralizar "██████╗ ██╗██████╗ ███████╗ ██████╗████████╗██╗   ██╗███████╗"
centralizar "██╔══██╗██║██╔══██╗██╔════╝██╔════╝╚══██╔══╝██║   ██║██╔════╝"
centralizar "██║  ██║██║██████╔╝█████╗  ██║        ██║   ██║   ██║███████╗"
centralizar "██║  ██║██║██╔══██╗██╔══╝  ██║        ██║   ██║   ██║╚════██║"
centralizar "██████╔╝██║██║  ██║███████╗╚██████╗   ██║   ╚██████╔╝███████║"
centralizar "╚═════╝ ╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝   ╚═╝    ╚═════╝ ╚══════╝"   
      echo -e "${reset}"
      echo ""
}

msg_odoo(){
  clear
    echo -e "${roxo}"
centralizar " ██████╗ ██████╗  ██████╗  ██████╗" 
centralizar "██╔═══██╗██╔══██╗██╔═══██╗██╔═══██╗"
centralizar "██║   ██║██║  ██║██║   ██║██║   ██║"
centralizar "██║   ██║██║  ██║██║   ██║██║   ██║"
centralizar "╚██████╔╝██████╔╝╚██████╔╝╚██████╔╝"
centralizar " ╚═════╝ ╚═════╝  ╚═════╝  ╚═════╝"
    echo -e "${reset}"
    echo ""  
}

msg_pgAdmin(){
  clear
    echo -e "${roxo}"
centralizar "██████╗  ██████╗      █████╗ ██████╗ ███╗   ███╗██╗███╗   ██╗    ██╗  ██╗"
centralizar "██╔══██╗██╔════╝     ██╔══██╗██╔══██╗████╗ ████║██║████╗  ██║    ██║  ██║"
centralizar "██████╔╝██║  ███╗    ███████║██║  ██║██╔████╔██║██║██╔██╗ ██║    ███████║"
centralizar "██╔═══╝ ██║   ██║    ██╔══██║██║  ██║██║╚██╔╝██║██║██║╚██╗██║    ╚════██║"
centralizar "██║     ╚██████╔╝    ██║  ██║██████╔╝██║ ╚═╝ ██║██║██║ ╚████║         ██║"
centralizar "╚═╝      ╚═════╝     ╚═╝  ╚═╝╚═════╝ ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝         ╚═╝"
    echo -e "${reset}"
    echo ""
}

msg_nocobase() {
  clear
    echo -e "${roxo}"
centralizar "███╗   ██╗ ██████╗  ██████╗ ██████╗ ██████╗  █████╗ ███████╗███████╗"
centralizar "████╗  ██║██╔═══██╗██╔════╝██╔═══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝"
centralizar "██╔██╗ ██║██║   ██║██║     ██║   ██║██████╔╝███████║███████╗█████╗"
centralizar "██║╚██╗██║██║   ██║██║     ██║   ██║██╔══██╗██╔══██║╚════██║██╔══╝"
centralizar "██║ ╚████║╚██████╔╝╚██████╗╚██████╔╝██████╔╝██║  ██║███████║███████╗"
centralizar "╚═╝  ╚═══╝ ╚═════╝  ╚═════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝"
    echo -e "${reset}"
    echo ""
}

msg_botpress(){
  clear
    echo -e "${roxo}"
centralizar "██████╗  ██████╗ ████████╗██████╗ ██████╗ ███████╗███████╗███████╗"
centralizar "██╔══██╗██╔═══██╗╚══██╔══╝██╔══██╗██╔══██╗██╔════╝██╔════╝██╔════╝"
centralizar "██████╔╝██║   ██║   ██║   ██████╔╝██████╔╝█████╗  ███████╗███████╗"
centralizar "██╔══██╗██║   ██║   ██║   ██╔═══╝ ██╔══██╗██╔══╝  ╚════██║╚════██║"
centralizar "██████╔╝╚██████╔╝   ██║   ██║     ██║  ██║███████╗███████║███████╗"
centralizar "╚═════╝  ╚═════╝    ╚═╝   ╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝"
    echo -e "${reset}"
    echo ""
}

msg_baserow(){
    clear
    echo -e "${roxo}"
centralizar "██████╗  █████╗ ███████╗███████╗██████╗  ██████╗ ██╗    ██╗"
centralizar "██╔══██╗██╔══██╗██╔════╝██╔════╝██╔══██╗██╔═══██╗██║    ██║"
centralizar "██████╔╝███████║███████╗█████╗  ██████╔╝██║   ██║██║ █╗ ██║"
centralizar "██╔══██╗██╔══██║╚════██║██╔══╝  ██╔══██╗██║   ██║██║███╗██║"
centralizar "██████╔╝██║  ██║███████║███████╗██║  ██║╚██████╔╝╚███╔███╔╝"
centralizar "╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝ ╚═════╝  ╚══╝╚══╝"
    echo -e "${reset}"
    echo ""
}

msg_mongodb(){
  clear
  echo -e "${roxo}"
centralizar "███╗   ███╗ ██████╗ ███╗   ██╗ ██████╗  ██████╗     ██████╗ ██████╗"
centralizar "████╗ ████║██╔═══██╗████╗  ██║██╔════╝ ██╔═══██╗    ██╔══██╗██╔══██╗"
centralizar "██╔████╔██║██║   ██║██╔██╗ ██║██║  ███╗██║   ██║    ██║  ██║██████╔╝"
centralizar "██║╚██╔╝██║██║   ██║██║╚██╗██║██║   ██║██║   ██║    ██║  ██║██╔══██╗"
centralizar "██║ ╚═╝ ██║╚██████╔╝██║ ╚████║╚██████╔╝╚██████╔╝    ██████╔╝██████╔╝"
centralizar "╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝  ╚═════╝     ╚═════╝ ╚═════╝"
  echo -e "${reset}"
  echo ""
}

msg_rabbitmq(){
  clear
  echo -e "${roxo}"
centralizar "██████╗  █████╗ ██████╗ ██████╗ ██╗████████╗    ███╗   ███╗ ██████╗"
centralizar "██╔══██╗██╔══██╗██╔══██╗██╔══██╗██║╚══██╔══╝    ████╗ ████║██╔═══██╗"
centralizar "██████╔╝███████║██████╔╝██████╔╝██║   ██║       ██╔████╔██║██║   ██║"
centralizar "██╔══██╗██╔══██║██╔══██╗██╔══██╗██║   ██║       ██║╚██╔╝██║██║▄▄ ██║"
centralizar "██║  ██║██║  ██║██████╔╝██████╔╝██║   ██║       ██║ ╚═╝ ██║╚██████╔╝"
centralizar "╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚═════╝ ╚═╝   ╚═╝       ╚═╝     ╚═╝ ╚══▀▀═╝"
  echo -e "${reset}"
  echo ""
}

msg_uptimekuma(){
  clear
  echo -e "${roxo}"
centralizar "██╗   ██╗██████╗ ████████╗██╗███╗   ███╗███████╗    ██╗  ██╗██╗   ██╗███╗   ███╗ █████╗"
centralizar "██║   ██║██╔══██╗╚══██╔══╝██║████╗ ████║██╔════╝    ██║ ██╔╝██║   ██║████╗ ████║██╔══██╗"
centralizar "██║   ██║██████╔╝   ██║   ██║██╔████╔██║█████╗      █████╔╝ ██║   ██║██╔████╔██║███████║"
centralizar "██║   ██║██╔═══╝    ██║   ██║██║╚██╔╝██║██╔══╝      ██╔═██╗ ██║   ██║██║╚██╔╝██║██╔══██║"
centralizar "╚██████╔╝██║        ██║   ██║██║ ╚═╝ ██║███████╗    ██║  ██╗╚██████╔╝██║ ╚═╝ ██║██║  ██║"
centralizar " ╚═════╝ ╚═╝        ╚═╝   ╚═╝╚═╝     ╚═╝╚══════╝    ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝"
  echo -e "${reset}"
  echo ""
}

msg_calcom(){
  clear
  echo -e "${roxo}"
centralizar " ██████╗ █████╗ ██╗         ██████╗ ██████╗ ███╗   ███╗"
centralizar "██╔════╝██╔══██╗██║        ██╔════╝██╔═══██╗████╗ ████║"
centralizar "██║     ███████║██║        ██║     ██║   ██║██╔████╔██║"
centralizar "██║     ██╔══██║██║        ██║     ██║   ██║██║╚██╔╝██║"
centralizar "╚██████╗██║  ██║███████╗██╗╚██████╗╚██████╔╝██║ ╚═╝ ██║"
centralizar " ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝ ╚═════╝ ╚═════╝ ╚═╝     ╚═╝"
  echo -e "${reset}"
  echo ""
}

msg_mautic(){
    clear
    echo -e "${roxo}"
centralizar "███╗   ███╗ █████╗ ██╗   ██╗████████╗██╗ ██████╗"
centralizar "████╗ ████║██╔══██╗██║   ██║╚══██╔══╝██║██╔════╝"
centralizar "██╔████╔██║███████║██║   ██║   ██║   ██║██║"     
centralizar "██║╚██╔╝██║██╔══██║██║   ██║   ██║   ██║██║"     
centralizar "██║ ╚═╝ ██║██║  ██║╚██████╔╝   ██║   ██║╚██████╗"
centralizar "╚═╝     ╚═╝╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚═╝ ╚═════╝"
    echo -e "${reset}"
    echo ""
}

msg_appsmith(){
    clear
    echo -e "${roxo}"
centralizar "   █████╗ ██████╗ ██████╗ ███████╗███╗   ███╗██╗████████╗██╗  ██╗"
centralizar "  ██╔══██╗██╔══██╗██╔══██╗██╔════╝████╗ ████║██║╚══██╔══╝██║  ██║"
centralizar "  ███████║██████╔╝██████╔╝███████╗██╔████╔██║██║   ██║   ███████║"
centralizar "  ██╔══██║██╔═══╝ ██╔═══╝ ╚════██║██║╚██╔╝██║██║   ██║   ██╔══██║"
centralizar "  ██║  ██║██║     ██║     ███████║██║ ╚═╝ ██║██║   ██║   ██║  ██║"
centralizar "  ╚═╝  ╚═╝╚═╝     ╚═╝     ╚══════╝╚═╝     ╚═╝╚═╝   ╚═╝   ╚═╝  ╚═╝"
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
echo -e "\e[33m⚠️ AVISO: GUARDE TODAS AS INFORMAÇÕES ACIMA NO SEU BLOCO DE NOTAS!\e[0m"
echo ""
echo -e "\e[36m📱 Nos acompanhe no Instagram: \e[1m@encha_ai\e[0m \e[36mpara mais dicas, atualizações e novidades!\e[0m"
echo ""
echo -e "\e[33m▶️ Aperte ENTER para voltar ao menu de ferramentas\e[0m"
read
sleep 2

}
  
# ==================================================================================================
# Este auto-instalador foi desenvolvido para auxiliar na instalação das principais aplicações
# disponíveis no mercado open source. Os créditos originais de cada aplicação pertencem
# aos respectivos desenvolvedores.
#
# Este script foi criado originalmente pela OrionDesign (contato@oriondesign.art.br | https://oriondesign.art.br/setup)
# e posteriormente refatorado pela Encha AI (instalador@encha.ai | https://encha.ai), uma ferramenta
# de IA para automação de tarefas e otimização de processos.
#
# Este Setup é licenciado sob a Licença MIT Modificada. Você pode usar, copiar, modificar,
# integrar, publicar, distribuir e/ou vender cópias dos produtos finais, desde que mantenha
# este aviso e declare, de forma visível, que OrionDesign é o autor original e que foi refatorado
# pela Encha AI, incluindo os links para https://oriondesign.art.br/setup e https://encha.ai.
# ==================================================================================================
#
# LICENÇA MIT MODIFICADA
#
# Copyright (c) 2025 OrionDesign (https://oriondesign.art.br/setup)
# Refatorado por Encha AI (https://encha.ai)
#
# Permissão é concedida, gratuitamente, a qualquer pessoa que obtenha uma cópia deste software
# e dos arquivos de documentação associados (o "Software"), para negociar o Software sem restrição,
# incluindo, sem limitação, os direitos de usar, copiar, modificar, mesclar, publicar, distribuir,
# sublicenciar e/ou vender cópias do Software, e permitir que pessoas a quem o Software é fornecido
# o façam, sujeitas às seguintes condições:
#
# 1. O aviso de copyright acima e este aviso de permissão devem ser incluídos em todas as cópias ou
#    partes substanciais do Software.
# 2. É obrigatório declarar, de forma visível, que OrionDesign (contato@oriondesign.art.br) é o autor
#    original e que foi refatorado pela Encha AI (contato@encha.ai), incluindo os links para
#    https://oriondesign.art.br/setup e https://encha.ai em qualquer redistribuição, seja ela
#    modificada ou não.
#
# O SOFTWARE É FORNECIDO "NO ESTADO EM QUE SE ENCONTRA", SEM GARANTIA DE QUALQUER TIPO, EXPRESSA OU
# IMPLÍCITA, INCLUINDO, MAS NÃO SE LIMITANDO ÀS GARANTIAS DE COMERCIALIZAÇÃO, ADEQUAÇÃO A UM FIM
# ESPECÍFICO E NÃO VIOLAÇÃO. EM NENHUM CASO OS AUTORES OU DETENTORES DE DIREITOS AUTORAIS SERÃO
# RESPONSÁVEIS POR QUALQUER REIVINDICAÇÃO, DANO OU OUTRA RESPONSABILIDADE, SEJA EM AÇÃO CONTRATUAL,
# DELITO OU DE OUTRA FORMA, DECORRENTE DE, OU EM CONEXÃO COM O SOFTWARE OU O USO OU OUTRAS NEGOCIAÇÕES
# NO SOFTWARE.
# ==================================================================================================



#TOOLS GERAIS

validar_senha() {
    senha=$1
    tamanho_minimo=$2
    tem_erro=0
    mensagem_erro=""

    # Verifica comprimento mínimo
    if [ ${#senha} -lt $tamanho_minimo ]; then
        mensagem_erro+="\n❌ Por segurança, sua senha precisa ter no mínimo $tamanho_minimo caracteres."
        tem_erro=1
    fi

    # Verifica letra maiúscula
    if ! [[ $senha =~ [A-Z] ]]; then
        mensagem_erro+="\n🔠 Falta pelo menos uma letra maiúscula."
        tem_erro=1
    fi

    # Verifica letra minúscula
    if ! [[ $senha =~ [a-z] ]]; then
        mensagem_erro+="\n🔡 Inclua ao menos uma letra minúscula."
        tem_erro=1
    fi

    # Verifica número
    if ! [[ $senha =~ [0-9] ]]; then
        mensagem_erro+="\n🔢 Quase lá! Inclua pelo menos um número."
        tem_erro=1
    fi

    # Verifica caracteres especiais permitidos (@ ou _)
    if ! [[ $senha =~ [@_] ]]; then
        mensagem_erro+="\n🔣 Inclua pelo menos um caractere especial: @ ou _."
        tem_erro=1
    fi

    # Verifica se há caracteres inválidos
    if [[ $senha =~ [^A-Za-z0-9@_] ]]; then
        mensagem_erro+="\n⚠️ Caracteres inválidos detectados. Use somente letras, números e @ ou _."
        tem_erro=1
    fi

    # Exibe erros, se houver
    if [ $tem_erro -eq 1 ]; then
        echo -e "\e[31mSua senha não atende aos requisitos. Veja o que precisa ajustar:$mensagem_erro\e[0m"
        return 1
    fi

    return 0
}



wait_stack() {
    echo -e "\e[33m⏳ Aguarde alguns instantes. Se demorar mais de 5 minutos, cancele e tente novamente.\e[0m"
    declare -A services_status=()

    # Inicializa todos os serviços como pendentes
    for service in "$@"; do
        services_status["$service"]="pendente"
    done

    local max_attempts=10
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        local all_active=true

        for service in "${!services_status[@]}"; do
            replicas=$(docker service ls --filter "name=$service" --format "{{.Replicas}}")
            echo -e "\e[35m🛠️ Serviço:\e[0m \e[36m$service\e[0m — Réplicas detectadas: \e[33m$replicas\e[0m"

            if [[ $replicas == */* ]]; then
                running=${replicas%%/*}
                total=${replicas##*/}

                echo -e "\e[36m📊 Status do Serviço:\e[0m em execução = \e[33m$running\e[0m de \e[32m$total\e[0m"

                if [ "$running" == "$total" ]; then
                    if [ "${services_status["$service"]}" != "ativo" ]; then
                        echo -e "\e[32m🟢 Serviço \e[32m$service\e[0m está ativo com todas as réplicas ($replicas)."
                        services_status["$service"]="ativo"
                    fi
                else
                    all_active=false
                    services_status["$service"]="pendente"
                fi
            else
                all_active=false
                services_status["$service"]="pendente"
            fi
        done

        if $all_active; then
            echo -e "\e[32m✅ Todos os serviços estão ativos.\e[0m"
            return 0
        fi

        echo -e "\e[36m⏳ Aguardando os serviços... (tentativa \e[33m$attempt/$max_attempts\e[36m)\e[0m"
        attempt=$((attempt + 1))
        sleep 30
    done

    echo -e "\e[31m🛑 Tempo esgotado: serviços não responderam a tempo.\e[0m"
    return 1
}



wait_30_sec() {
    echo -e "\e[36m⏳ Aguardando 30 segundos...\e[0m"
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
        echo -e "Para refazer a instalação, remova a stack \e[33m${nome_stack}\e[0m no Portainer e tente novamente."
        echo -e ""
        echo -e "Você será redirecionado ao menu principal em 10 segundos..."
        sleep 10
        clear
        return 0
    else
        return 1
    fi
}


verificar_docker_e_portainer_traefik() {
    # Verifica se o Docker está instalado
    if ! command -v docker &> /dev/null; then
        clear
        echo -e "\e[33m[Atenção]\e[0m O componente \e[32m[1] Traefik e Portainer\e[0m ainda não está instalado."
        echo -e "Para continuar, é necessário instalar esse componente primeiro."
        echo -e "\n\e[31m✖ Por favor, realize a instalação antes de prosseguir.\e[0m"
        echo -e "\nVoltando ao menu principal em \e[36m5 segundos...\e[0m"
        sleep 5
        return 1
    fi

    # Verifica se o Portainer está em execução
    if ! docker ps --format "{{.Names}}" | grep -q "portainer"; then
        clear
        echo -e "\e[33m[Atenção]\e[0m O componente \e[32m[1] Traefik e Portainer\e[0m ainda não está instalado."
        echo -e "Para continuar, é necessário instalar esse componente primeiro."
        echo -e "\n\e[31m✖ Por favor, realize a instalação antes de prosseguir.\e[0m"
        echo -e "\nVoltando ao menu principal em \e[36m5 segundos...\e[0m"
        sleep 5
        return 1
    fi

    # Verifica se o Traefik está em execução
    if ! docker ps --format "{{.Names}}" | grep -q "traefik"; then
        clear
        echo -e "\e[33m[Atenção]\e[0m O componente \e[32m[1] Traefik e Portainer\e[0m ainda não está instalado."
        echo -e "Para continuar, é necessário instalar esse componente primeiro."
        echo -e "\n\e[31m✖ Por favor, realize a instalação antes de prosseguir.\e[0m"
        echo -e "\nVoltando ao menu principal em \e[36m5 segundos...\e[0m"
        sleep 5
        return 1
    fi

    return 0
}


verificar_minio() {
    if ! docker ps --format "{{.Names}}" | grep -q "minio"; then
        clear
        echo -e "\e[33m[Atenção]\e[0m O componente \e[32m[7] MinIO\e[0m ainda não está instalado."
        echo -e "Para continuar, é necessário instalar essa opção primeiro."
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

verificar_container_postgres_formacao_encha() {
    if docker ps -q --filter "name=postgres_formacao_encha" | grep -q .; then
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
pegar_senha_postgres_formacao_encha(){
    while :; do
        if [ -f /root/postgres_formacao_encha.yaml ]; then
            senha_postgres=$(grep "POSTGRES_PASSWORD" /root/postgres_formacao_encha.yaml | awk -F '=' '{print $2}')
            echo -e "to aqui 2"
            break
        else
            echo -e "erro pegar senha do postgres formacao encha"
            sleep 5
        fi
    done
}

pegar_senha_minio(){
      user_minio=$(grep -i "MINIO_ROOT_USER" /root/minio.yaml | head -1 | sed 's/#.*//' | sed 's/.*=//; s/^[[:space:]]*//; s/[[:space:]]*$//')
    senha_minio=$(grep -i "MINIO_ROOT_PASSWORD" /root/minio.yaml | head -1 | sed 's/#.*//' | sed 's/.*=//; s/^[[:space:]]*//; s/[[:space:]]*$//')
    url_minio=$(grep -i "MINIO_BROWSER_REDIRECT_URL" /root/minio.yaml | head -1 | sed 's/#.*//' | sed 's/.*=//; s/^[[:space:]]*//; s/[[:space:]]*$//' | sed 's|https://||')
    url_s3=$(grep -i "MINIO_SERVER_URL" /root/minio.yaml | head -1 | sed 's/#.*//' | sed 's/.*=//; s/^[[:space:]]*//; s/[[:space:]]*$//' | sed 's|https://||')
}

criar_bucket.minio(){
S3_ENDPOINT="http://minio:9000"
ADMIN_USER="$user_minio"
ADMIN_PASS="$senha_minio"
BUCKET="$1"

POLICY_NAME="publicread-$BUCKET"
POLICY_FILE="public-read-$BUCKET.json"
S3_ACCESS_KEY=$(openssl rand -base64 12 | tr -dc A-Z0-9 | head -c16)
S3_SECRET_KEY=$(openssl rand -base64 32 | tr -dc A-Za-z0-9 | head -c32)

MINIO_CONTAINER=$(docker ps --filter "name=minio" -q | head -n1)
if [ -z "$MINIO_CONTAINER" ]; then
  echo -e "\e[31m❌ Container do MinIO não encontrado!\e[0m"
  exit 1
fi

MC_CMD="docker exec -i $MINIO_CONTAINER mc"

echo -e "\e[33m🔗 Conectando ao MinIO como admin...\e[0m"
$MC_CMD alias set admin "$S3_ENDPOINT" "$ADMIN_USER" "$ADMIN_PASS" || { echo -e "\e[31m❌ Erro ao criar alias 'admin'\e[0m"; exit 1; }

echo -e "\e[36m📦 Verificando se o bucket '\e[97m$BUCKET\e[36m' existe...\e[0m"
if $MC_CMD ls admin/"$BUCKET" >/dev/null 2>&1; then
  echo -e "\e[33m⚠️  Bucket '\e[97m$BUCKET\e[33m' já existe, continuando...\e[0m"
else
  echo -e "\e[32m✅ Criando bucket '\e[97m$BUCKET\e[32m'...\e[0m"
  $MC_CMD mb admin/"$BUCKET" || echo -e "\e[33m⚠️  Falha ao criar bucket, mas prosseguindo...\e[0m"
fi

echo -e "\e[34m📜 Criando política pública para o bucket...\e[0m"
docker exec -i "$MINIO_CONTAINER" bash -c "cat > /tmp/$POLICY_FILE <<EOF
{
  \"Version\": \"2012-10-17\",
  \"Statement\": [
    {
      \"Effect\": \"Allow\",
      \"Principal\": \"*\",
      \"Action\": [
        \"s3:GetBucketLocation\",
        \"s3:ListBucket\"
      ],
      \"Resource\": [
        \"arn:aws:s3:::$BUCKET\"
      ]
    },
    {
      \"Effect\": \"Allow\",
      \"Principal\": \"*\",
      \"Action\": [
        \"s3:GetObject\",
        \"s3:PutObject\",
        \"s3:DeleteObject\"
      ],
      \"Resource\": [
        \"arn:aws:s3:::$BUCKET/*\"
      ]
    }
  ]
}
EOF" || { echo -e "\e[31m❌ Erro ao criar o arquivo de política no container\e[0m"; exit 1; }

echo -e "\e[34m🔐 Criando política '\e[97m$POLICY_NAME\e[34m'...\e[0m"
$MC_CMD admin policy create admin "$POLICY_NAME" /tmp/"$POLICY_FILE" || { echo -e "\e[31m❌ Erro ao criar política\e[0m"; exit 1; }

echo -e "\e[34m👤 Criando usuário de acesso S3...\e[0m"
$MC_CMD admin user add admin "$S3_ACCESS_KEY" "$S3_SECRET_KEY" || { echo -e "\e[31m❌ Erro ao criar usuário\e[0m"; exit 1; }

echo -e "\e[34m🔗 Atribuindo política ao usuário...\e[0m"
$MC_CMD admin policy attach admin "$POLICY_NAME" --user "$S3_ACCESS_KEY" || { echo -e "\e[31m❌ Erro ao associar política ao usuário\e[0m"; exit 1; }

echo -e "\e[33m🌍 Aplicando política pública ao bucket...\e[0m"
$MC_CMD anonymous set-json /tmp/"$POLICY_FILE" admin/"$BUCKET" || { echo -e "\e[31m❌ Erro ao aplicar política pública\e[0m"; exit 1; }

echo -e "\e[32m✅ Criando alias 'myminio' com chaves de acesso...\e[0m"
$MC_CMD alias set myminio "$S3_ENDPOINT" "$S3_ACCESS_KEY" "$S3_SECRET_KEY"

echo -e "\e[36m📂 Listando arquivos do bucket para testar conexão...\e[0m"
$MC_CMD ls myminio/"$BUCKET" || echo -e "\e[33m⚠️  Falha ao listar bucket, mas a configuração pode estar correta.\e[0m"

echo ""
echo -e "\e[32m✅🪣 Bucket '$BUCKET' configurado com sucesso no MinIO!\e[0m"
echo -e "\e[33m🔑 Access Key:\e[97m $S3_ACCESS_KEY\e[0m"
echo -e "\e[33m🔐 Secret Key:\e[97m $S3_SECRET_KEY\e[0m"
echo ""

}

criar_banco_postgres_da_stack() {
    while :; do
        if docker ps -q --filter "name=^postgres_postgres" | grep -q .; then
            CONTAINER_ID=$(docker ps -q --filter "name=^postgres_postgres")

            # Verifica se o banco de dados já existe
            docker exec "$CONTAINER_ID" psql -U postgres -lqt | cut -d \| -f 1 | grep -qw "$1"
            if [ $? -eq 0 ]; then
                echo ""
                read -p $'\e[33mO banco de dados \e[97m'"$1"$'\e[33m já existe.\e[0m Deseja apagar e criar um novo? \e[32m(Y/N)\e[0m: ' resposta
                if [[ "$resposta" =~ ^[Yy]$ ]]; then
                    # Apaga o banco de dados (sem o force, pois o comando padrão não usa)
                    docker exec "$CONTAINER_ID" psql -U postgres -c "DROP DATABASE IF EXISTS $1;" > /dev/null 2>&1
                    if [ $? -eq 0 ]; then
                        echo -e "\e[32mBanco de dados $1 apagado com sucesso.\e[0m"
                    else
                        echo -e "\e[31mErro ao apagar o banco de dados $1.\e[0m"
                    fi
                    # Cria o banco novamente
                    docker exec "$CONTAINER_ID" psql -U postgres -c "CREATE DATABASE $1;" > /dev/null 2>&1
                    if [ $? -eq 0 ]; then
                        echo -e "\e[32mBanco de dados $1 criado com sucesso.\e[0m"
                    else
                        echo -e "\e[31mErro ao criar o banco de dados $1.\e[0m"
                    fi
                else
                    echo -e "\e[33mOperação cancelada. Mantendo o banco existente.\e[0m"
                fi
                break
            else
                # Cria o banco de dados
                docker exec "$CONTAINER_ID" psql -U postgres -c "CREATE DATABASE $1;" > /dev/null 2>&1

                # Verifica se foi criado com sucesso
                docker exec "$CONTAINER_ID" psql -U postgres -lqt | cut -d \| -f 1 | grep -qw "$1"
                if [ $? -eq 0 ]; then
                    echo -e "\e[32mBanco de dados $1 criado com sucesso.\e[0m"
                    break
                else
                    echo -e "\e[31mErro ao criar o banco de dados. Tentando novamente...\e[0m"
                    echo ""
                fi
            fi
        else
            echo -e "\e[33mAguardando o container do Postgres iniciar...\e[0m"
            sleep 5
        fi
    done
}

criar_banco_postgres_da_stack_formacao_encha() {
    local dbname="$1"
    while :; do
        # Verifica se o container do Postgres está rodando
        if docker ps -q --filter "name=^postgres_formacao_encha_postgres" | grep -q .; then
            CONTAINER_ID=$(docker ps -q --filter "name=^postgres_formacao_encha_postgres")

            # Verifica se o banco já existe
            if docker exec "$CONTAINER_ID" psql -U postgres -lqt | cut -d \| -f 1 | grep -qw "$dbname"; then
                read -p $'\e[33mO banco de dados \e[97m'"$dbname"$'\e[33m já existe.\e[0m Deseja apagar e criar um novo banco de dados? \e[32m(Y/N)\e[0m: ' resposta
                if [[ "$resposta" =~ ^[Yy]$ ]]; then
                    echo -e "\e[33mApagando o banco de dados \e[97m$dbname\e[33m...\e[0m"
                    docker exec "$CONTAINER_ID" psql -U postgres -c "DROP DATABASE IF EXISTS \"$dbname\";" > /dev/null 2>&1
                    echo -e "\e[33mCriando o banco de dados \e[97m$dbname\e[33m...\e[0m"
                    docker exec "$CONTAINER_ID" psql -U postgres -c "CREATE DATABASE \"$dbname\";" > /dev/null 2>&1
                else
                    echo -e "\e[33mMantendo o banco de dados existente.\e[0m"
                fi
                break
            else
                echo -e "\e[33mCriando o banco de dados \e[97m$dbname\e[33m...\e[0m"
                docker exec "$CONTAINER_ID" psql -U postgres -c "CREATE DATABASE \"$dbname\";" > /dev/null 2>&1

                # Verifica se o banco foi criado com sucesso
                if docker exec "$CONTAINER_ID" psql -U postgres -lqt | cut -d \| -f 1 | grep -qw "$dbname"; then
                    echo -e "\e[32mBanco de dados \e[97m$dbname\e[32m criado com sucesso.\e[0m"
                    break
                else
                    echo -e "\e[31mErro ao criar o banco de dados. Tentando novamente...\e[0m"
                    sleep 2
                fi
            fi
        else
            echo -e "\e[33mAguardando container do Postgres iniciar...\e[0m"
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
    local dbname="$1"
    while :; do
        # Verifica se o container do PGVector está rodando
        if docker ps -q --filter "name=^pgvector_pgvector" | grep -q .; then
            CONTAINER_PGVECTOR_ID=$(docker ps -q --filter "name=^pgvector_pgvector")

            # Verifica se o banco já existe
            if docker exec "$CONTAINER_PGVECTOR_ID" psql -U postgres -lqt | cut -d \| -f 1 | grep -qw "$dbname"; then
                read -p $'\e[33m⚠️  O banco de dados \e[97m'"$dbname"$'\e[33m já existe.\e[0m\n\e[33m❓ Deseja apagar e criar um novo banco de dados? \e[32m(Y/N)\e[0m: ' resposta
                if [[ "$resposta" =~ ^[Yy]$ ]]; then
                    echo -e "\e[33mApagando o banco de dados \e[97m$dbname\e[33m...\e[0m"
                    docker exec "$CONTAINER_PGVECTOR_ID" psql -U postgres -c "DROP DATABASE IF EXISTS \"$dbname\";" > /dev/null 2>&1
                    echo -e "\e[33mCriando o banco de dados \e[97m$dbname\e[33m...\e[0m"
                    docker exec "$CONTAINER_PGVECTOR_ID" psql -U postgres -c "CREATE DATABASE \"$dbname\";" > /dev/null 2>&1
                else
                    echo -e "\e[33mMantendo o banco de dados existente.\e[0m"
                fi
                break
            else
                echo -e "\e[33mCriando o banco de dados \e[97m$dbname\e[33m...\e[0m"
                docker exec "$CONTAINER_PGVECTOR_ID" psql -U postgres -c "CREATE DATABASE \"$dbname\";" > /dev/null 2>&1

                # Verifica se o banco foi criado com sucesso
                if docker exec "$CONTAINER_PGVECTOR_ID" psql -U postgres -lqt | cut -d \| -f 1 | grep -qw "$dbname"; then
                    echo -e "\e[32m✅ Banco de dados \e[97m$dbname\e[32m criado com sucesso.\e[0m"
                    break
                else
                    echo -e "\e[31m❌ Erro ao criar o banco de dados. Tentando novamente...\e[0m"
                    sleep 2
                fi
            fi
        else
            echo -e "\e[33mAguardando container do PGVector iniciar...\e[0m"
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

liberar_chatwoot() {
    clear
    stack_name="chatwoot"
    
    if ! docker stack ls --format "{{.Name}}" | grep -q "^${stack_name}$"; then
        echo -e "\e[1;31m❌ Erro: A stack do Chatwoot não está instalada.\e[0m"
        echo -e "\e[1;33m⚠️  Por favor, instale a stack do Chatwoot antes de continuar.\e[0m"
        sleep 5
        return 1
    fi       


    echo -e "\e[1;36m🔓 Verificando liberação do Chatwoot...\e[0m"
    sleep 2

    local dados_vps="/root/dados_vps/dados_chatwoot"
    local container_id
    container_id=$(docker ps -q --filter "name=pgvector")

    if [[ -z "$container_id" ]]; then
        echo -e "\e[1;31m❌ Erro: container do Postgres (pgvector) não encontrado.\e[0m"
        return 1
    fi

    if [ ! -f "$dados_vps" ]; then
        echo -e "\e[31m[ERRO]\e[0m Arquivo de dados não encontrado em: $dados_vps"
        return 1
    fi

    local url_chatwoot
    url_chatwoot=$(grep "Dominio do Chatwoot:" "$dados_vps" | awk -F': ' '{print $2}')

    # Loop até a entrada ser encontrada
    while true; do
        local row_count
        row_count=$(docker exec -i "$container_id" psql -U postgres -d chatwoot -t -c \
            "SELECT 1 FROM public.installation_configs WHERE name = 'INSTALLATION_IDENTIFIER' LIMIT 1;" | grep -c 1)

        if [[ $row_count -eq 0 ]]; then
            echo -e "\e[1;33m⚠️  A entrada ainda não foi encontrada. Siga os passos abaixo:\e[0m"

            echo -e "\n\e[1;34m🌐 Acesse o painel do Chatwoot:\e[0m $url_chatwoot"

            echo -e "\n\e[1;33mEtapa 1:\e[0m Crie uma conta no Chatwoot com e-mail e senha."
            read -p $'\e[32m✅ Pressione ENTER depois de criar a conta...\e[0m'

            echo -e "\n\e[1;33mEtapa 2:\e[0m Faça login com a conta criada."
            read -p $'\e[32m✅ Pressione ENTER depois de fazer login...\e[0m'

            echo -e "\n\e[1;33mEtapa 3:\e[0m Acesse o superadmin:"
            echo -e "\e[1;34m   ➤ $url_chatwoot/super_admin\e[0m"
            read -p $'\e[32m✅ Pressione ENTER depois de acessar o painel de superadmin...\e[0m'


            echo -e "\e[1;36m🔄 Verificando novamente...\e[0m"
            sleep 2
            clear
        else
            break
        fi
    done

    # Atualizações após confirmação da entrada
    local uuid
    uuid=$(uuidgen)

    echo -e "\e[1;32m✅ Entrada encontrada. Aplicando atualizações...\e[0m"
    docker exec -i "$container_id" psql -U postgres -d chatwoot -c "
        UPDATE public.installation_configs 
        SET serialized_value = '\"--- !ruby/hash:ActiveSupport::HashWithIndifferentAccess\nvalue: enterprise\n\"' 
        WHERE name = 'INSTALLATION_PRICING_PLAN';

        UPDATE public.installation_configs 
        SET serialized_value = '\"--- !ruby/hash:ActiveSupport::HashWithIndifferentAccess\nvalue: 10000\n\"' 
        WHERE name = 'INSTALLATION_PRICING_PLAN_QUANTITY';

        UPDATE public.installation_configs 
        SET serialized_value = '\"--- !ruby/hash:ActiveSupport::HashWithIndifferentAccess\nvalue: $uuid\n\"' 
        WHERE name = 'INSTALLATION_IDENTIFIER';"

    clear
    echo -e "\e[1;32m✅ Chatwoot liberado com sucesso!\e[0m"
    read -p $'\e[1;33mPressione ENTER para continuar...\e[0m'
}


verificar_container_redis() {
    if docker ps -q --filter "name=redis_redis" | grep -q .; then
        return 0
    else
        return 1
    fi
}
verificar_container_redis_formacao_encha() {
    if docker ps -q --filter "name=redis_formacao_encha" | grep -q .; then
        return 0
    else
        return 1
    fi
}


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
    echo -ne "\e[36mEscolha um nome para o seu servidor (ex: Encha): \e[0m" && read -r nome_servidor
    echo ""

    echo -e "Passo \e[33m5/6\e[0m 🌐"
    echo -e "\e[33m--> Não pode conter espaços e/ou caracteres especiais.\e[0m"
    echo -ne "\e[36mDigite um nome para sua rede interna (ex: EnchaNet): \e[0m" && read -r nome_rede_interna
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
    echo -e "Passo \e[33m1/10\e[0m ✅ - Stack do Postgres criada com sucesso"
else
    echo -e "Passo \e[33m1/10\e[0m ❌ [\e[31mFALHOU\e[0m] - Falha ao criar a stack do Postgres"
    echo -e "⚠️ \e[33mNão foi possível criar a stack do Postgres.\e[0m"
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

ferramenta_mysql() {
  dados

  senha_mysql=$(openssl rand -hex 16)

  cat > mysql.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  mysql:
    image: percona/percona-server:8.0
    command:
      - "--character-set-server=utf8mb4"
      - "--collation-server=utf8mb4_unicode_ci"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - ${nome_rede_interna}
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=${senha_mysql}
      - TZ=America/Sao_Paulo
    deploy:
      resources:
        limits:
          cpus: "1"
          memory: 2048M
volumes:
  mysql_data:
networks:
  ${nome_rede_interna}:
    external: true
EOL

  STACK_NAME="mysql"
  stack_editavel
  wait_stack mysql_mysql

  cd /root/dados_vps
  cat > dados_mysql <<EOL
[ MYSQL ]

Host: mysql
Porta: 3306
Usuario: root
Senha: ${senha_mysql}
EOL

  cd
  echo ""
}

verificar_container_mysql() {
  if docker ps -q --filter "name=mysql_mysql" | grep -q .; then
    return 0
  else
    return 1
  fi
}

pegar_senha_mysql_da_stack() {
  while :; do
    if [ -f /root/dados_vps/dados_mysql ]; then
      senha_mysql=$(grep "Senha:" /root/dados_vps/dados_mysql | awk -F': ' '{print $2}')
      break
    else
      echo "Aguardando arquivo de dados do MySQL..."
      sleep 5
    fi
  done
}

criar_banco_mysql_da_stack() {
    local dbname="$1"
    while :; do
        if docker ps -q --filter "name=^mysql_mysql" | grep -q .; then
            CONTAINER_ID=$(docker ps -q --filter "name=^mysql_mysql")

            # Verifica se o banco de dados já existe
            if docker exec -e MYSQL_PWD="$senha_mysql" "$CONTAINER_ID" mysql -u root -e "SHOW DATABASES LIKE '$dbname';" | grep -q "$dbname"; then
                echo -e "\e[33mO banco de dados '$dbname' já existe. Mantendo o banco existente.\e[0m"
                break
            else
                # Cria o banco de dados
                docker exec -e MYSQL_PWD="$senha_mysql" "$CONTAINER_ID" mysql -u root -e "CREATE DATABASE $dbname;" > /dev/null 2>&1
                
                # Verifica se foi criado com sucesso
                if docker exec -e MYSQL_PWD="$senha_mysql" "$CONTAINER_ID" mysql -u root -e "SHOW DATABASES LIKE '$dbname';" | grep -q "$dbname"; then
                    echo -e "\e[32mBanco de dados '$dbname' criado com sucesso.\e[0m"
                    break
                else
                    echo -e "\e[31mErro ao criar o banco de dados. Tentando novamente...\e[0m"
                    sleep 2
                fi
            fi
        else
            echo "Container MySQL não encontrado. Aguardando..."
            sleep 5
        fi
    done
}


ferramenta_postgres_formacao_encha() {

## Ativa a função dados para pegar os dados da vps
dados


## Gerando uma senha aleatória para o Postgres
senha_postgres=$(openssl rand -hex 16)

## Criando a stack postgres.yaml
cat > postgres_formacao_encha.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  postgres_formacao_encha:
    image: postgres:16 ## Versão do postgres
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
    name: postgres_formacao_encha

networks:
  $nome_rede_interna: ## Nome da rede interna
    external: true
    name: $nome_rede_interna ## Nome da rede interna
EOL
if [ $? -eq 0 ]; then
    echo -e "Passo \e[33m1/10\e[0m ✅ - Stack do Postgres Formação Encha criada com sucesso"
else
    echo -e "Passo \e[33m1/10\e[0m ❌ [\e[31mFALHOU\e[0m] - Falha ao criar a stack do Postgres Formação Encha"
    echo -e "⚠️ \e[33mNão foi possível criar a stack do Postgres Formação Encha.\e[0m"
fi
STACK_NAME="postgres_formacao_encha"
stack_editavel #> /dev/null 2>&1

cd dados_vps

cat > dados_postgres_formacao_encha <<EOL
[ POSTGRES ]

Dominio do postgres: postgres://postgres_formacao_encha:5432

Usuario: postgres

Senha: $senha_postgres
EOL

cd
cd

## Espera 30 segundos
wait_stack "postgres_formacao_encha"

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
    echo -e "Passo \e[33m1/1\e[0m 🌐"
    echo -ne "\e[36mDigite o domínio para a Evolution API (ex: evolution.encha.ai): \e[0m" && read -r url_evolution
    echo ""

    ## Limpa o terminal
    clear
    


    ## Informação sobre URL
    msg_evolution_api
    echo ""
    echo -e "\e[33m🔍 Por favor, revise as informações abaixo:\e[0m\n"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "\e[33m🌐 Domínio da Evolution API:\e[97m $url_evolution\e[0m"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    ## Pergunta se as respostas estão corretas
  
    read -p $'\e[32m✅ As respostas estão corretas?\e[0m \e[33m(Y/N)\e[0m: ' confirmacao
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
      #- CONFIG_SESSION_PHONE_VERSION=2.3000.1025062854
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
    echo -e "Passo \e[33m1/10\e[0m ✅ - Stack criada com sucesso"
else
    echo -e "Passo \e[33m1/10\e[0m ❌ [\e[31mFALHOU\e[0m] - Falha ao criar a stack da Evolution API"
    echo -e "⚠️ \e[33mNão foi possível criar a stack da Evolution API.\e[0m"
fi
STACK_NAME="evolution${1:+_$1}"
stack_editavel 




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
    echo -e "Passo \e[33m1/10\e[0m ✅ - Stack do PgVector criada com sucesso"
else
    echo -e "Passo \e[33m1/10\e[0m ❌ [\e[31mFALHOU\e[0m] - Falha ao criar a stack do PgVector"
    echo -e "⚠️ \e[33mNão foi possível criar a stack do PgVector.\e[0m"
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
    echo -en "\e[33m📥 Digite o email que será usado para SMTP (ex: instalador@encha.ai): \e[0m" && read -r email_admin_chatwoot
    echo ""

    ## Extrai domínio do SMTP
    dominio_smtp_chatwoot=$(echo "$email_admin_chatwoot" | cut -d "@" -f 2)

    ## Passo 3 - Usuário SMTP
    echo -e "\e[97m👤 Passo$amarelo 3/6 - Usuário SMTP\e[0m"
    echo -e "$amareloℹ️  Caso não tenha um usuário específico, use o próprio email acima.\e[0m"
    echo -en "\e[33m🧑‍💼 Digite o usuário do SMTP (ex: encha.ai ou instalador@encha.ai): \e[0m" && read -r user_smtp_chatwoot
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
    msg_chatwoot
    echo ""
    echo -e "\e[33m🔍 Por favor, revise as informações abaixo:\e[0m\n"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "\e[33m🌐 Domínio do Chatwoot:      \e[97m$url_chatwoot\e[0m"
    echo -e "\e[33m🏢 Nome da Empresa:         \e[97m$nome_empresa_chatwoot\e[0m"
    echo -e "\e[33m📧 Email SMTP:              \e[97m$email_admin_chatwoot\e[0m"
    echo -e "\e[33m👤 Usuário SMTP:            \e[97m$user_smtp_chatwoot\e[0m"
    echo -e "\e[33m🔑 Senha SMTP:              \e[97m$senha_email_chatwoot\e[0m"
    echo -e "\e[33m🖥️  Host SMTP:              \e[97m$smtp_email_chatwoot\e[0m"
    echo -e "\e[33m🔌 Porta SMTP:              \e[97m$porta_smtp_chatwoot\e[0m"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""


    ## Pergunta se as respostas estão corretas
    read -p $'\e[32m✅ As respostas estão corretas?\e[0m \e[33m(Y/N)\e[0m: ' confirmacao
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
    echo -e "Passo \e[32m1/3\e[0m ✅ - Postgres já instalado."
    pegar_senha_pgvector > /dev/null 2>&1
    echo -e "Passo \e[32m2/3\e[0m 🔐 - Senha do PgVector copiada com sucesso."
    criar_banco_pgvector_da_stack "chatwoot${1:+_$1}"
    echo -e "Passo \e[32m3/3\e[0m 🛠️ - Banco de dados 'chatwoot${1:+_$1}' criado com sucesso."
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
      - CHATWOOT_HUB_URL=https://encha.ai#

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
    echo -e "Passo \e[33m1/10\e[0m ✅ - Stack do Redis criada com sucesso"
else
    echo -e "Passo \e[33m1/10\e[0m ❌ [\e[31mFALHOU\e[0m] - Falha ao criar a stack do Redis"
    echo -e "⚠️ \e[33mNão foi possível criar a stack do Redis.\e[0m"
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



ferramenta_redis_formacao_encha() {

## Ativa a função dados para pegar os dados da vps
dados



## Criando a stack do redis.yaml
cat > redis_formacao_encha.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  redis_formacao_encha:
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
    name: redis_formacao_encha

networks:
  $nome_rede_interna: ## Nome da rede interna
    external: true
    name: $nome_rede_interna ## Nome da rede interna
EOL
if [ $? -eq 0 ]; then
    echo -e "Passo \e[33m1/10\e[0m ✅ - Stack do Redis Formação Encha criada com sucesso"
else
    echo -e "Passo \e[33m1/10\e[0m ❌ [\e[31mFALHOU\e[0m] - Falha ao criar a stack do Redis Formação Encha"
    echo -e "⚠️ \e[33mNão foi possível criar a stack do Redis Formação Encha.\e[0m"
fi

STACK_NAME="redis_formacao_encha"
stack_editavel 

cd dados_vps

cat > dados_redis_formacao_encha <<EOL
[ REDIS ]

Dominio do Redis: redis://redis_formacao_encha:6379

Usuario: redis

EOL

cd
cd

## Espera 30 segundos
wait_stack "redis_formacao_encha"

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
    echo -en "\e[33m📧 Informe o Email para SMTP (ex: instalador@encha.ai): \e[0m" && read -r email_smtp_n8n
    echo ""

    ## Pergunta o usuário do Email SMTP
    echo -e "\e[97mPasso$amarelo 4/7\e[0m"
    echo -e "$amarelo➡️ Caso não tenha um usuário separado, utilize o próprio email abaixo"
    echo -en "\e[33m👤 Informe o Usuário para SMTP (ex: encha ou instalador@encha.ai): \e[0m" && read -r usuario_smtp_n8n
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
    
  
    msg_n8n
    echo ""
    echo -e "\e[33m🔍 Por favor, revise as informações abaixo:\e[0m\n"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "\e[33m🌐 Domínio do N8N:           \e[97m$url_editorn8n\e[0m"
    echo -e "\e[33m🔗 Domínio do Webhook:       \e[97m$url_webhookn8n\e[0m"
    echo -e "\e[33m📧 Email SMTP:               \e[97m$email_smtp_n8n\e[0m"
    echo -e "\e[33m👤 Usuário SMTP:             \e[97m$usuario_smtp_n8n\e[0m"
    echo -e "\e[33m🔑 Senha SMTP:               \e[97m$senha_smtp_n8n\e[0m"
    echo -e "\e[33m🖥️  Host SMTP:               \e[97m$host_smtp_n8n\e[0m"
    echo -e "\e[33m🔌 Porta SMTP:               \e[97m$porta_smtp_n8n\e[0m"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    read -p $'\e[32m✅ As respostas estão corretas?\e[0m \e[33m(Y/N)\e[0m: ' confirmacao
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
    echo -e "Passo \e[33m1/10\e[0m ✅ - Stack do N8N criada com sucesso"
else
    echo -e "Passo \e[33m1/10\e[0m ❌ [\e[31mFALHOU\e[0m] - Falha ao criar a stack do N8N"
    echo -e "⚠️ \e[33mNão foi possível criar a stack do N8N.\e[0m"
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

ferramenta_n8n_formacao_encha() {
msg_n8n_formacao_encha

dados

while true; do

    ## Pergunta o domínio do N8N
    echo -e "\e[97mPasso$amarelo 1/4\e[0m"
    echo -en "\e[33m🌐 Informe o domínio para o N8N (ex: n8n.encha.ai): \e[0m" && read -r url_editorn8n
    echo ""

    ## Pergunta o domínio do Webhook
    echo -e "\e[97mPasso$amarelo 2/4\e[0m"
    echo -en "\e[33m🔗 Informe o domínio para o Webhook do N8N (ex: webhook.encha.ai): \e[0m" && read -r url_webhookn8n
    echo ""

    while true; do
      ## Pergunta a quantidade de Webhooks
      echo -e "\e[97mPasso$amarelo 3/4\e[0m"
      echo -en "\e[33m🔧 Insira a quantidade de Webhooks (máximo 5): \e[0m" && read -r webhooksQuantity
      echo ""

      echo -e "\e[97mPasso$amarelo 3/4\e[0m"
      echo -en "\e[33m🔧 Insira a quantidade de Concorrências (mínimo: 10 - máximo 100): \e[0m" && read -r concurrencyQuantity
      echo ""

      if [[ "$webhooksQuantity" =~ ^[1-5]$ ]] && [[ "$concurrencyQuantity" =~ ^([1-9][0-9]|100)$ ]]; then
          break
      else
          echo -e "\e[31m⚠️  Quantidade inválida. Por favor, informe Webhooks entre 1-5 e Concorrência entre 10-100.\e[0m"
      fi
    done


    
    
        
    ## Limpa o terminal
    clear
    msg_n8n_formacao_encha
    echo ""
    echo -e "\e[33m🔍 Por favor, revise as informações abaixo:\e[0m\n"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "\e[33m🌐 Domínio do N8N:           \e[97m$url_editorn8n\e[0m"
    echo -e "\e[33m🔗 Domínio do Webhook:       \e[97m$url_webhookn8n\e[0m"
    echo -e "\e[33m🔧 Quantidade de Webhooks:   \e[97m$webhooksQuantity\e[0m"
    echo -e "\e[33m🔧 Quantidade de Concorrências: \e[97m$concurrencyQuantity\e[0m"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    read -p $'\e[32m✅ As respostas estão corretas?\e[0m \e[33m(Y/N)\e[0m: ' confirmacao
    if [ "$confirmacao" = "Y" ] || [ "$confirmacao" = "y" ]; then
        clear
        break
    else
        msg_n8n_formacao_encha
    fi
done

echo -e "\e[97m🚀 Iniciando a instalação do N8N da Formação Encha...\e[33m [Etapa 1 de 5]\e[0m"
echo ""
sleep 1


echo -e "\e[97m📦 Verificando ou instalando o Postgres Formação Encha\e[33m [Etapa 2 de 5]\e[0m"
echo ""
sleep 1


verificar_container_postgres_formacao_encha
if [ $? -eq 0 ]; then
    echo "✅ 1/3 - Postgres da Formação Encha já está instalado."
    pegar_senha_postgres_formacao_encha > /dev/null 2>&1
    echo "🔐 2/3 - Senha do Postgres copiada com sucesso."
    criar_banco_postgres_da_stack_formacao_encha "n8n_queue${1:+_$1}"
    echo "🛠️  3/3 - Banco de dados 'n8n_queue${1:+_$1}' criado com sucesso."
    echo ""
else
    ferramenta_postgres_formacao_encha
    pegar_senha_postgres_formacao_encha > /dev/null 2>&1
    criar_banco_postgres_da_stack_formacao_encha "n8n_queue${1:+_$1}"
fi

echo -e "\e[97m📦 Verificando ou instalando o Redis Formação Encha...\e[33m [Etapa 3 de 5]\e[0m"
echo ""
sleep 1
verificar_container_redis_formacao_encha
if [ $? -eq 0 ]; then
    echo "✅ 1/1 - Redis Formação Encha já está instalado."
    echo ""
else
    ferramenta_redis_formacao_encha
fi

echo -e "\e[97m⚙️ Instalando o N8N Formação Encha...\e[33m [Etapa 4 de 5]\e[0m"
echo ""
sleep 1

encryption_key=$(openssl rand -hex 16)


cat > n8n_editor_formacao_encha.yaml <<EOL
version: "3.7"
# Definição dos Serviços
services:
  # ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
  # ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
  # ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀
  # Definição do Serviço do Editor
  n8n_editor_formacao_encha:
    # imagem do docker
    # se possível, não use a latest .. deixe uma versão fixa
    # https://hub.docker.com/r/n8nio/n8n/tags
    image: n8nio/n8n:latest
    # Define o hotname do container
    hostname: "{{.Service.Name}}.{{.Task.Slot}}"
    # comando padrão para subir o servidor web do editor
    command: start
    # configura a rede do serviço
    networks:
      - $nome_rede_interna
    # configura as variáveis de ambiente
    environment:
      #########################################################
      #########################################################
      # Configuração Gerais do N8N ############################
      #########################################################
      #########################################################
      # Gere uma nova chave aqui https://www.avast.com/random-password-generator#mac
      - N8N_ENCRYPTION_KEY=encryption_key
      # Configura o ambiente de execução do N8N
      - NODE_ENV=production
      # Configura o Tamanho do Payload aceito pelo N8N (em MB)
      - N8N_PAYLOAD_SIZE_MAX=16
      # Configura o nível de log do N8N
      - N8N_LOG_LEVEL=info
      # Configura o Timezone do N8N
      - GENERIC_TIMEZONE=America/Sao_Paulo
      # Configura a Permissão do Arquivo de Configuração
      - N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true
      #########################################################
      #########################################################
      #########################################################
      # Configuração do Banco de Dados ########################
      #########################################################
      #########################################################
      #########################################################
      # Define o Tipo de Banco de Dados para Postgres
      - DB_TYPE=postgresdb
      # Configura o Nome do Banco de Dados
      - DB_POSTGRESDB_DATABASE=n8n_queue${1:+_$1}
      # Configura o Host do Banco de Dados
      - DB_POSTGRESDB_HOST=postgres_formacao_encha
      # Configura a Porta do Banco de Dados
      - DB_POSTGRESDB_PORT=5432
      # Configura o Usuário do Banco de Dados
      - DB_POSTGRESDB_USER=postgres
      # Configura a Senha do Banco de Dados
      - DB_POSTGRESDB_PASSWORD=$senha_postgres
      # Define o Schema para o Banco de Dados
      - DB_POSTGRESDB_SCHEMA=public
      #########################################################
      #########################################################
      #########################################################
      # Configuração do Endereço do N8N #######################
      #########################################################
      #########################################################
      #########################################################
      # Define a Porta http para o N8N (padrão: 5678)
      - N8N_PORT=5678
      # Configura o Host do Editor do N8N
      - N8N_HOST=$url_editorn8n
      # Configura o Endereço competo do Editor (tem que deixar / no final)
      - N8N_EDITOR_BASE_URL=https://$url_editorn8n/
      # Força o uso de SSL nas URL internas do N8N
      - N8N_PROTOCOL=https
      # Configura o Endereço do Webhook
      # Pode ser subdomínio ou outro domínio
      - WEBHOOK_URL=https://$url_webhookn8n/
      #########################################################
      #########################################################
      #########################################################
      # Configuração da Modo de Execução do N8N (fila) ########
      #########################################################
      #########################################################
      #########################################################
      - EXECUTIONS_MODE=queue
      # Configura o host do Redis
      - QUEUE_BULL_REDIS_HOST=redis_formacao_encha
      # Configura a porta do Redis
      - QUEUE_BULL_REDIS_PORT=6379
      # Configura o indice do banco de dados do Redis
      - QUEUE_BULL_REDIS_DB=2
      # Configura a senha do Redis (caso você use senha no redis)
      # - QUEUE_BULL_REDIS_PASSWORD=SENHA
      #########################################################
      #########################################################
      # Configuração da Manutenção e Limpeza do N8N ###########
      #########################################################
      #########################################################
      # Configura a limpeza dos dados de execução
      - EXECUTIONS_DATA_PRUNE=true
      # Configura o tempo máximo de armazenamento dos dados de execução
      - EXECUTIONS_DATA_MAX_AGE=336 # 2 semanas
      #########################################################
      #########################################################
      # Configuração de Bibliotecas do N8N ####################
      #########################################################
      #########################################################
      # Configura quais bibliotecas nativas podem ser importardas no node Code
      - NODE_FUNCTION_ALLOW_BUILTIN=*
      # Configura as bibliotecas externas que serão utilizadas
      - NODE_FUNCTION_ALLOW_EXTERNAL=moment,lodash
      # Habilita o uso de pacotes da comunidade
      - N8N_COMMUNITY_PACKAGES_ENABLED=true
      # Reinstalar os Community Nodes
      - N8N_REINSTALL_MISSING_PACKAGES=true
      - N8N_RUNNERS_ENABLED=true
    # Configura o Modo de Deploy da Aplicação
    deploy:
      # O editor será executado no modo de replicação
      mode: replicated
      # Vamos ter apenas uma instância do editor
      replicas: 1
      # Configura o local de execução
      placement:
        constraints:
          # Você pode rodar o Editor no Manager mesmo pois usa poucos recursos
          - node.role == manager
          # - node.hostname == worker1
          # - node.labels.app == http # nome do label: app, valor do label: http
      # Limitação
      resources:
        # Definição dos Limites de Recursos deste Serviço
        limits:
          # Define a quantidade de CPU para o N8N para evitar travamento do Host
          cpus: "1"
          # Define a quantidade de RAM para o N8N para evitar travamento do Host
          memory: 1024M
      # Define os Labels do Serviço
      labels:
        # Configura o Roteamento do Traefik
        - traefik.enable=true
        # Define o enderço do Editor do N8N
        - traefik.http.routers.n8n_editor_formacao_encha.rule=Host(\`$url_editorn8n\`)
        # Redireciona o endereço para HTTPS
        - traefik.http.routers.n8n_editor_formacao_encha.entrypoints=websecure
        # Define o certificado SSL
        - traefik.http.routers.n8n_editor_formacao_encha.tls.certresolver=letsencryptresolver
        # Define o serviço do Editor
        - traefik.http.routers.n8n_editor_formacao_encha.service=n8n_editor_formacao_encha
        # Define a porta do serviço do Editor
        - traefik.http.services.n8n_editor_formacao_encha.loadbalancer.server.port=5678
        # Define o uso do Host Header
        - traefik.http.services.n8n_editor_formacao_encha.loadbalancer.passHostHeader=true
      # Configura o modo de atualização do serviço
      update_config:
        # Configura o paralelismo de atualização
        parallelism: 1
        # Configura o tempo de espera entre as atualizações
        delay: 30s
        # Configura a ação em caso de falha
        order: start-first
        # Configura a ação em caso de falha
        failure_action: rollback
networks:
  $nome_rede_interna:
    name: $nome_rede_interna
    external: true
EOL

if [ $? -eq 0 ]; then
    echo -e "Passo \e[33m1/10\e[0m ✅ - Stack do N8N Editor criada com sucesso"
else
    echo -e "Passo \e[33m1/10\e[0m ❌ [\e[31mFALHOU\e[0m] - Falha ao criar a stack do N8N Editor"
    echo -e "⚠️ \e[33mNão foi possível criar a stack do N8N Editor.\e[0m"
fi


STACK_NAME="n8n_editor_formacao_encha"
stack_editavel 

wait_services="n8n_editor_formacao_encha_n8n_editor_formacao_encha"
wait_stack $wait_services

cat > n8n_worker_formacao_encha.yaml <<EOL
version: "3.7"
# Definição dos Serviços
services:
  # ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
  # ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
  # ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀
  # Definição do Serviço do Worker
  n8n_worker_formacao_encha:
    # imagem do docker
    # se possível, não use a latest .. deixe uma versão fixa
    # https://hub.docker.com/r/n8nio/n8n/tags
    image: n8nio/n8n:latest
    # Define o hotname do container
    hostname: "{{.Service.Name}}.{{.Task.Slot}}"
    # comando padrão para subir o servidor web
    command: worker --concurrency=$concurrencyQuantity
    # configura a rede do serviço
    networks:
      - $nome_rede_interna
    # configura as variáveis de ambiente
    environment:
#########################################################
      #########################################################
      # Configuração Gerais do N8N ############################
      #########################################################
      #########################################################
      # Gere uma nova chave aqui https://www.avast.com/random-password-generator#mac
      - N8N_ENCRYPTION_KEY=encryption_key
      # Configura o ambiente de execução do N8N
      - NODE_ENV=production
      # Configura o Tamanho do Payload aceito pelo N8N (em MB)
      - N8N_PAYLOAD_SIZE_MAX=16
      # Configura o nível de log do N8N
      - N8N_LOG_LEVEL=info
      # Configura o Timezone do N8N
      - GENERIC_TIMEZONE=America/Sao_Paulo
      # Configura a Permissão do Arquivo de Configuração
      - N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true
      #########################################################
      #########################################################
      #########################################################
      # Configuração do Banco de Dados ########################
      #########################################################
      #########################################################
      #########################################################
      # Define o Tipo de Banco de Dados para Postgres
      - DB_TYPE=postgresdb
      # Configura o Nome do Banco de Dados
      - DB_POSTGRESDB_DATABASE=n8n_queue${1:+_$1}
      # Configura o Host do Banco de Dados
      - DB_POSTGRESDB_HOST=postgres_formacao_encha
      # Configura a Porta do Banco de Dados
      - DB_POSTGRESDB_PORT=5432
      # Configura o Usuário do Banco de Dados
      - DB_POSTGRESDB_USER=postgres
      # Configura a Senha do Banco de Dados
      - DB_POSTGRESDB_PASSWORD=$senha_postgres
      # Define o Schema para o Banco de Dados
      - DB_POSTGRESDB_SCHEMA=public
      #########################################################
      #########################################################
      #########################################################
      # Configuração do Endereço do N8N #######################
      #########################################################
      #########################################################
      #########################################################
      # Define a Porta http para o N8N (padrão: 5678)
      - N8N_PORT=5678
      # Configura o Host do Editor do N8N
      - N8N_HOST=$url_editorn8n
      # Configura o Endereço competo do Editor (tem que deixar / no final)
      - N8N_EDITOR_BASE_URL=https://$url_editorn8n/
      # Força o uso de SSL nas URL internas do N8N
      - N8N_PROTOCOL=https
      # Configura o Endereço do Webhook
      # Pode ser subdomínio ou outro domínio
      - WEBHOOK_URL=https://$url_webhookn8n/
      #########################################################
      #########################################################
      #########################################################
      # Configuração da Modo de Execução do N8N (fila) ########
      #########################################################
      #########################################################
      #########################################################
      - EXECUTIONS_MODE=queue
      # Configura o host do Redis
      - QUEUE_BULL_REDIS_HOST=redis_formacao_encha
      # Configura a porta do Redis
      - QUEUE_BULL_REDIS_PORT=6379
      # Configura o indice do banco de dados do Redis
      - QUEUE_BULL_REDIS_DB=2
      # Configura a senha do Redis (caso você use senha no redis)
      # - QUEUE_BULL_REDIS_PASSWORD=SENHA
      #########################################################
      #########################################################
      # Configuração da Manutenção e Limpeza do N8N ###########
      #########################################################
      #########################################################
      # Configura a limpeza dos dados de execução
      - EXECUTIONS_DATA_PRUNE=true
      # Configura o tempo máximo de armazenamento dos dados de execução
      - EXECUTIONS_DATA_MAX_AGE=336 # 2 semanas
      #########################################################
      #########################################################
      # Configuração de Bibliotecas do N8N ####################
      #########################################################
      #########################################################
      # Configura quais bibliotecas nativas podem ser importardas no node Code
      - NODE_FUNCTION_ALLOW_BUILTIN=*
      # Configura as bibliotecas externas que serão utilizadas
      - NODE_FUNCTION_ALLOW_EXTERNAL=moment,lodash
      # Habilita o uso de pacotes da comunidade
      - N8N_COMMUNITY_PACKAGES_ENABLED=true
      # Reinstalar os Community Nodes
      - N8N_REINSTALL_MISSING_PACKAGES=true
      - N8N_RUNNERS_ENABLED=true
    # Configura o Modo de Deploy da Aplicação
    deploy:
      # O editor será executado no modo de replicação
      mode: replicated
      # Vamos ter apenas uma instância do editor
      replicas: 1
      # Configura o local de execução
      placement:
        # Você pode rodar o Editor no Manager mesmo pois usa poucos recursos
        constraints:
          - node.role == manager
          # - node.hostname == worker1
          # - node.labels.app == webhooks # nome do label: app, valor do label: webhooks
      resources:
        # Definição dos Limites de Recursos deste Serviço
        limits:
          # Define a quantidade de CPU para o N8N para evitar travamento do Host
          cpus: "1"
          # Define a quantidade de RAM para o N8N para evitar travamento do Host
          memory: 1024M
      # Configura o modo de atualização do serviço
      update_config:
        # Configura o paralelismo de atualização
        parallelism: 1
        # Configura o tempo de espera entre as atualizações
        delay: 30s
        # Configura a ação em caso de falha
        order: start-first
        # Configura a ação em caso de falha
        failure_action: rollback
networks:
  $nome_rede_interna:
    name: $nome_rede_interna
    external: true
EOL
if [ $? -eq 0 ]; then
    echo -e "Passo \e[33m1/10\e[0m ✅ - Stack do N8N Worker criada com sucesso"
else
    echo -e "Passo \e[33m1/10\e[0m ❌ [\e[31mFALHOU\e[0m] - Falha ao criar a stack do N8N Worker"
    echo -e "⚠️ \e[33mNão foi possível criar a stack do N8N Worker.\e[0m"
fi


STACK_NAME="n8n_worker_formacao_encha"
stack_editavel

wait_services="n8n_worker_formacao_encha_n8n_worker_formacao_encha"
wait_stack $wait_services

cat > n8n_webhook_formacao_encha.yaml <<EOL
version: "3.7"
# Definição dos Serviços
services:
  # ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
  # ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
  # ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀
  # Definição do Serviço do Worker
  n8n_webhook_formacao_encha:
    # imagem do docker
    # se possível, não use a latest .. deixe uma versão fixa
    # https://hub.docker.com/r/n8nio/n8n/tags
    image: n8nio/n8n:latest
    # Define o hotname do container
    hostname: "{{.Service.Name}}.{{.Task.Slot}}"
    # comando padrão para subir o servidor web
    command: webhook
    # configura a rede do serviço
    networks:
      - $nome_rede_interna
    # configura as variáveis de ambiente
    environment:
 #########################################################
      #########################################################
      # Configuração Gerais do N8N ############################
      #########################################################
      #########################################################
      # Gere uma nova chave aqui https://www.avast.com/random-password-generator#mac
      - N8N_ENCRYPTION_KEY=$encryption_key
      # Configura o ambiente de execução do N8N
      - NODE_ENV=production
      # Configura o Tamanho do Payload aceito pelo N8N (em MB)
      - N8N_PAYLOAD_SIZE_MAX=16
      # Configura o nível de log do N8N
      - N8N_LOG_LEVEL=info
      # Configura o Timezone do N8N
      - GENERIC_TIMEZONE=America/Sao_Paulo
      # Configura a Permissão do Arquivo de Configuração
      - N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true
      #########################################################
      #########################################################
      #########################################################
      # Configuração do Banco de Dados ########################
      #########################################################
      #########################################################
      #########################################################
      # Define o Tipo de Banco de Dados para Postgres
      - DB_TYPE=postgresdb
      # Configura o Nome do Banco de Dados
      - DB_POSTGRESDB_DATABASE=n8n_queue${1:+_$1}
      # Configura o Host do Banco de Dados
      - DB_POSTGRESDB_HOST=postgres_formacao_encha
      # Configura a Porta do Banco de Dados
      - DB_POSTGRESDB_PORT=5432
      # Configura o Usuário do Banco de Dados
      - DB_POSTGRESDB_USER=postgres
      # Configura a Senha do Banco de Dados
      - DB_POSTGRESDB_PASSWORD=$senha_postgres
      # Define o Schema para o Banco de Dados
      - DB_POSTGRESDB_SCHEMA=public
      #########################################################
      #########################################################
      #########################################################
      # Configuração do Endereço do N8N #######################
      #########################################################
      #########################################################
      #########################################################
      # Define a Porta http para o N8N (padrão: 5678)
      - N8N_PORT=5678
      # Configura o Host do Editor do N8N
      - N8N_HOST=$url_editorn8n
      # Configura o Endereço competo do Editor (tem que deixar / no final)
      - N8N_EDITOR_BASE_URL=https://$url_editorn8n/
      # Força o uso de SSL nas URL internas do N8N
      - N8N_PROTOCOL=https
      # Configura o Endereço do Webhook
      # Pode ser subdomínio ou outro domínio
      - WEBHOOK_URL=https://$url_webhookn8n/
      #########################################################
      #########################################################
      #########################################################
      # Configuração da Modo de Execução do N8N (fila) ########
      #########################################################
      #########################################################
      #########################################################
      - EXECUTIONS_MODE=queue
      # Configura o host do Redis
      - QUEUE_BULL_REDIS_HOST=redis_formacao_encha
      # Configura a porta do Redis
      - QUEUE_BULL_REDIS_PORT=6379
      # Configura o indice do banco de dados do Redis
      - QUEUE_BULL_REDIS_DB=2
      # Configura a senha do Redis (caso você use senha no redis)
      # - QUEUE_BULL_REDIS_PASSWORD=SENHA
      #########################################################
      #########################################################
      # Configuração da Manutenção e Limpeza do N8N ###########
      #########################################################
      #########################################################
      # Configura a limpeza dos dados de execução
      - EXECUTIONS_DATA_PRUNE=true
      # Configura o tempo máximo de armazenamento dos dados de execução
      - EXECUTIONS_DATA_MAX_AGE=336 # 2 semanas
      #########################################################
      #########################################################
      # Configuração de Bibliotecas do N8N ####################
      #########################################################
      #########################################################
      # Configura quais bibliotecas nativas podem ser importardas no node Code
      - NODE_FUNCTION_ALLOW_BUILTIN=*
      # Configura as bibliotecas externas que serão utilizadas
      - NODE_FUNCTION_ALLOW_EXTERNAL=moment,lodash
      # Habilita o uso de pacotes da comunidade
      - N8N_COMMUNITY_PACKAGES_ENABLED=true
      # Reinstalar os Community Nodes
      - N8N_REINSTALL_MISSING_PACKAGES=true
      - N8N_RUNNERS_ENABLED=true
    # Configura o Modo de Deploy da Aplicação
    deploy:
      # O editor será executado no modo de replicação
      mode: replicated
      # Vamos ter apenas uma instância do editor
      replicas: $webhooksQuantity
      # Configura o local de execução
      placement:
        # Você pode rodar o Editor no Manager mesmo pois usa poucos recursos
        constraints:
          - node.role == manager
          # - node.hostname == worker1
          # - node.labels.app == workers # nome do label: app, valor do label: workers
      resources:
        # Definição dos Limites de Recursos deste Serviço
        limits:
          # Define a quantidade de CPU para o N8N para evitar travamento do Host
          cpus: "1"
          # Define a quantidade de RAM para o N8N para evitar travamento do Host
          memory: 1024M
      # Define os Labels do Serviço
      labels:
        # Configura o Roteamento do Traefik
        - traefik.enable=true
        # Define o enderço do Webhook do N8N
        - traefik.http.routers.n8n_webhook_formacao_encha.rule=Host(\`$url_webhookn8n\`)
        # Redireciona o endereço para HTTPS
        - traefik.http.routers.n8n_webhook_formacao_encha.entrypoints=websecure
        # Define o certificado SSL
        - traefik.http.routers.n8n_webhook_formacao_encha.tls.certresolver=letsencryptresolver
        # Define o serviço do Webhook
        - traefik.http.routers.n8n_webhook_formacao_encha.service=n8n_webhook_formacao_encha
        # Define a porta do serviço do Webhook
        - traefik.http.services.n8n_webhook_formacao_encha.loadbalancer.server.port=5678
        # Define o uso do Host Header
        - traefik.http.services.n8n_webhook_formacao_encha.loadbalancer.passHostHeader=true
      # Configura o modo de atualização do serviço
      update_config:
        # Configura o paralelismo de atualização
        parallelism: 1
        # Configura o tempo de espera entre as atualizações
        delay: 30s
        # Configura a ação em caso de falha
        order: start-first
        # Configura a ação em caso de falha
        failure_action: rollback
networks:
  $nome_rede_interna:
    name: $nome_rede_interna
    external: true
EOL

if [ $? -eq 0 ]; then
    echo -e "Passo \e[33m1/10\e[0m ✅ - Stack do N8N Webhook criada com sucesso"
else
    echo -e "Passo \e[33m1/10\e[0m ❌ [\e[31mFALHOU\e[0m] - Falha ao criar a stack do N8N Webhook"
    echo -e "⚠️ \e[33mNão foi possível criar a stack do N8N Webhook.\e[0m"
fi


STACK_NAME="n8n_webhook_formacao_encha"
stack_editavel



pull n8nio/n8n:latest

# Gera lista de serviços para o wait_stack
wait_services="n8n_webhook_formacao_encha_n8n_webhook_formacao_encha"
wait_stack $wait_services


echo -e "\e[97m🎯 Tudo pronto! \e[33m[Etapa 5 de 5]\e[0m"

cd dados_vps

cat > dados_n8n_formacao_encha${1:+_$1} <<EOL
[ N8N ]

Dominio do N8N: https://$url_editorn8n

Dominio do Webhook do N8N: https://$url_webhookn8n

Email: Precisa criar no primeiro acesso do N8N

Senha: Precisa criar no primeiro acesso do N8N

EOL

cd
cd

wait_30_sec

msg_resumo_informacoes

echo -e "\e[33m🌐 Domínio do Editor:     \e[97mhttps://$url_editorn8n\e[0m"
echo -e "\e[33m🔗 Domínio do Webhook:    \e[97mhttps://$url_webhookn8n\e[0m"
echo -e "\e[33m👤 Email de Acesso:       \e[97mSerá criado no primeiro login do N8N\e[0m"
echo -e "\e[33m🔑 Senha de Acesso:       \e[97mSerá definida no primeiro login do N8N\e[0m"
echo ""

msg_retorno_menu

}

ferramenta_minio(){
 
  msg_minio
  
  dados

  

while true; do

    ## Passo 1 - Domínio do MinIO
    echo -e "\e[97mPasso$amarelo 1/4\e[0m"
    echo -en "\e[33m🌐 Informe o domínio para o MinIO (ex: minio.encha.ai): \e[0m" && read -r url_minio
    echo ""

    ## Passo 2 - Domínio do S3 do MinIO
    echo -e "\e[97mPasso$amarelo 2/4\e[0m"
    echo -en "\e[33m🔗 Informe o domínio para o S3 (ex: minioS3.encha.ai): \e[0m" && read -r url_s3
    echo ""

    ## Passo 3 - Usuário do MinIO
    echo -e "\e[97mPasso$amarelo 3/4\e[0m"
    echo -e "$amarelo➡️  Evite os caracteres especiais: \! # \$ e espaços"
    echo -en "\e[33m👤 Informe um nome de usuário para o MinIO (ex: Encha || Admin): \e[0m" && read -r user_minio
    echo ""


    
    echo -e "Passo \e[33m4/4\e[0m 🔐"
    echo -e "\e[33m--> Mínimo 8 caracteres. Use letras MAIÚSCULAS e minúsculas, números e um caractere especial @ ou _\e[0m"
    echo -e "\e[33m--> Evite caracteres especiais como: \\!#$\e[0m"
    echo -ne "\e[36mDigite uma senha para o Portainer (ex: Porta@12345_): \e[0m" && read -r senha_minio
    echo ""





    ## Limpa a tela para mostrar o resumo
    clear

    msg_minio
    echo ""
    echo -e "\e[33m🔍 Por favor, revise as informações abaixo:\e[0m\n"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "\e[33m🌐 Domínio do MinIO:         \e[97m$url_minio\e[0m"
    echo -e "\e[33m🔗 Domínio do S3:            \e[97m$url_s3\e[0m"
    echo -e "\e[33m👤 Usuário MinIO:            \e[97m$user_minio\e[0m"
    echo -e "\e[33m🔑 Senha MinIO:              \e[97m$senha_minio\e[0m"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    ## Pergunta confirmação
    read -p $'\e[32m✅ As respostas estão corretas?\e[0m \e[33m(Y/N)\e[0m: ' confirmacao
    if [[ "$confirmacao" =~ ^[Yy]$ ]]; then
        clear
        break
    else
        msg_minio
    fi
  done
  echo -e "\e[97m🎯 Iniciando a instalação do MinIO... \e[33m[Etapa 1 de 5]\e[0m"
  echo ""
  sleep 3 

cat > minio${1:+_$1}.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  minio${1:+_$1}:
    image: quay.io/minio/minio:latest ## Versão do Minio
    command: server /data --console-address ":9001"

    volumes:
      - minio${1:+_$1}_data:/data

    networks:
      - $nome_rede_interna ## Nome da rede interna

    environment:
      ## Dados de acesso
      - MINIO_ROOT_USER=$user_minio
      - MINIO_ROOT_PASSWORD=$senha_minio 

      ## Url do minio
      - MINIO_BROWSER_REDIRECT_URL=https://$url_minio ## Url do minio
      - MINIO_SERVER_URL=https://$url_s3 ## Url do s3 | Comente esta linha caso tiver erro ao fazer login

      ## Região
      - MINIO_REGION_NAME=eu-south

    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.minio_public${1:+_$1}.rule=Host(\`$url_s3\`) ## Url do s3
        - traefik.http.routers.minio_public${1:+_$1}.entrypoints=websecure
        - traefik.http.routers.minio_public${1:+_$1}.tls.certresolver=letsencryptresolver
        - traefik.http.services.minio_public${1:+_$1}.loadbalancer.server.port=9000
        - traefik.http.services.minio_public${1:+_$1}.loadbalancer.passHostHeader=true
        - traefik.http.routers.minio_public${1:+_$1}.service=minio_public${1:+_$1}
        - traefik.http.routers.minio_console${1:+_$1}.rule=Host(\`$url_minio\`) ## Url do minio
        - traefik.http.routers.minio_console${1:+_$1}.entrypoints=websecure
        - traefik.http.routers.minio_console${1:+_$1}.tls.certresolver=letsencryptresolver
        - traefik.http.services.minio_console${1:+_$1}.loadbalancer.server.port=9001
        - traefik.http.services.minio_console${1:+_$1}.loadbalancer.passHostHeader=true
        - traefik.http.routers.minio_console${1:+_$1}.service=minio_console${1:+_$1}

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

volumes:
  minio${1:+_$1}_data:
    external: true
    name: minio${1:+_$1}_data

networks:
  $nome_rede_interna: ## Nome da rede interna
    external: true
    name: $nome_rede_interna ## Nome da rede interna
EOL
if [ $? -eq 0 ]; then
    echo -e "Passo \e[33m1/10\e[0m ✅ - Stack do Minio criada com sucesso"
else
    echo -e "Passo \e[33m1/10\e[0m ❌ [\e[31mFALHOU\e[0m] - Falha ao criar a stack do Minio"
    echo -e "⚠️ \e[33mNão foi possível criar a stack do Minio.\e[0m"
fi

STACK_NAME="minio${1:+_$1}"
stack_editavel 

echo -e "\e[97m🔍 Verificando o serviço...\e[33m [Etapa 5 de 5]\e[0m"

pull quay.io/minio/minio:latest
wait_stack minio${1:+_$1}_minio${1:+_$1}

cd dados_vps
cat > dados_minio${1:+_$1} <<EOL
[ MinIO ]

Dominio do MinIO: https://$url_minio

Dominio do S3: https://$url_s3

Usuário: $user_minio

Senha: $senha_minio

EOL

cd

cd

wait_30_sec

msg_resumo_informacoes

echo -e "\e[32m🪣 [ MINIO INSTALADO COM SUCESSO ]\e[0m"
echo ""

echo -e "\e[33m🌐 Domínio do MinIO:       \e[97mhttps://$url_minio\e[0m"
echo -e "\e[33m🔗 Domínio do S3:          \e[97mhttps://$url_s3\e[0m"
echo -e "\e[33m👤 Usuário de Acesso:      \e[97m$user_minio\e[0m"
echo -e "\e[33m🔑 Senha de Acesso:        \e[97m$senha_minio\e[0m"
echo ""


msg_retorno_menu

}

ferramenta_typebot(){
  
  msg_typebot

  dados

while true; do

    ## Passo 1 - Domínio Builder
    echo -e "\e[97mPasso$amarelo 1/7\e[0m"
    echo -en "\e[33m🌐 Digite o domínio para o Typebot Builder (ex: type.encha.ai): \e[0m" && read -r url_typebot
    echo ""

    ## Passo 2 - Domínio Viewer
    echo -e "\e[97mPasso$amarelo 2/7\e[0m"
    echo -en "\e[33m🔎 Digite o domínio para o Typebot Viewer (ex: viewer.encha.ai): \e[0m" && read -r url_viewer
    echo ""

    ## Passo 3 - Email SMTP
    echo -e "\e[97mPasso$amarelo 3/7\e[0m"
    echo -en "\e[33m📧 Digite o email para SMTP (ex: instalador@encha.ai): \e[0m" && read -r email_typebot
    echo ""

    ## Passo 4 - Usuário SMTP
    echo -e "\e[97mPasso$amarelo 4/7\e[0m"
    echo -e "$amarelo➡️  Caso não tenha um usuário separado, use o próprio email abaixo"
    echo -en "\e[33m👤 Digite o usuário para SMTP (ex: encha ou instalador@encha.ai): \e[0m" && read -r usuario_email_typebot
    echo ""

    ## Passo 5 - Senha SMTP
    echo -e "\e[97mPasso$amarelo 5/7\e[0m"
    echo -e "$amarelo➡️  Sem caracteres especiais: \! # \$ | Se estiver usando Gmail, utilize senha de app"
    echo -en "\e[33m🔑 Digite a senha SMTP do email (ex: @Senha123_): \e[0m" && read -r senha_email_typebot
    echo ""

    ## Passo 6 - Host SMTP
    echo -e "\e[97mPasso$amarelo 6/7\e[0m"
    echo -en "\e[33m🏠 Digite o host SMTP do email (ex: smtp.hostinger.com): \e[0m" && read -r smtp_email_typebot
    echo ""

    ## Passo 7 - Porta SMTP
    echo -e "\e[97mPasso$amarelo 7/7\e[0m"
    echo -en "\e[33m🔌 Digite a porta SMTP do email (ex: 465): \e[0m" && read -r porta_smtp_typebot
    echo ""

    ## Define secure SMTP com base na porta
    if [ "$porta_smtp_typebot" -eq 465 ]; then
        smtp_secure_typebot=true
    else
        smtp_secure_typebot=false
    fi

    ## Limpa o terminal
    clear

    ## Nome da aplicação (se for função externa)
    nome_typebot

    ## Mensagem "conferindo informações"
    conferindo_as_info

    ## Exibe resumo
    msg_typebot
    echo ""
    echo -e "\e[33m🔍 Por favor, revise as informações abaixo:\e[0m\n"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "\e[33m🌐 Domínio do Builder:         \e[97mhttps://$url_typebot\e[0m"
    echo -e "\e[33m🔎 Domínio do Viewer:          \e[97mhttps://$url_viewer\e[0m"
    echo -e "\e[33m📧 Email SMTP:                 \e[97m$email_typebot\e[0m"
    echo -e "\e[33m👤 Usuário SMTP:               \e[97m$usuario_email_typebot\e[0m"
    echo -e "\e[33m🔑 Senha SMTP:                 \e[97m$senha_email_typebot\e[0m"
    echo -e "\e[33m🏠 Host SMTP:                  \e[97m$smtp_email_typebot\e[0m"
    echo -e "\e[33m🔌 Porta SMTP:                 \e[97m$porta_smtp_typebot\e[0m"
    echo -e "\e[33m🔐 Secure SMTP:                \e[97m$smtp_secure_typebot\e[0m"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    ## Confirmação
    read -p $'\e[32m✅ As respostas estão corretas?\e[0m \e[33m(Y/N)\e[0m: ' confirmacao
    if [[ "$confirmacao" =~ ^[Yy]$ ]]; then
        clear
        break
    else
        msg_typebot
    fi
done

echo -e "\e[97m🎯 Iniciando a instalação do Typebot... \e[33m[Etapa 1 de 5]\e[0m"
echo ""
sleep 3

echo -e "\e[97m📦 Verificando ou instalando o Postgres...\e[33m [Etapa 2 de 5]\e[0m"
echo ""
sleep 1

## Verifica se tem postgres, se sim pega a senha e cria um banco nele, se não instala, pega a senha e cria o banco
verificar_container_postgres
if [ $? -eq 0 ]; then
    echo -e "Passo \e[32m1/3\e[0m ✅ - Postgres já está instalado."
    pegar_senha_postgres > /dev/null 2>&1
    echo -e "Passo \e[32m2/3\e[0m 🔐 - Senha do Postgres copiada com sucesso."
    criar_banco_postgres_da_stack "typebot${1:+_$1}"
    echo -e "Passo \e[32m3/3\e[0m 🛠️ - Banco de dados 'typebot${1:+_$1}' criado com sucesso."
    echo ""
else
    ferramenta_postgres
    pegar_senha_postgres > /dev/null 2>&1
    criar_banco_postgres_da_stack "typebot${1:+_$1}"
fi


echo -e "\e[97m📦 • Criando bucket no MinIO \e[33m[3/5]\e[0m"
echo ""
sleep 1

pegar_senha_minio
criar_bucket.minio typebot${1:+-$1} > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "Passo \e[32m1/1\e[0m ✅ - Bucket 'typebot${1:+-$1}' criado com sucesso no MinIO."
else
    echo -e "Passo \e[31m1/1\e[0m ❌ - Erro ao criar o bucket 'typebot${1:+-$1}' no MinIO."
fi

echo -e "\e[32m🤖 [ INSTALANDO TYPEBOT ] \e[33m[4/5]\e[0m\n"
sleep 1



key_typebot=$(openssl rand -hex 16)


cat > typebot${1:+_$1}.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  typebot${1:+_$1}_builder:
    image: baptistearno/typebot-builder:latest ## Versão do Builder do Typebot

    networks:
      - $nome_rede_interna ## Nome da rede interna

    environment:
      ## Dados do Postgres
      - DATABASE_URL=postgresql://postgres:$senha_postgres@postgres:5432/typebot${1:+_$1}

      ## Encryption key
      - ENCRYPTION_SECRET=$key_typebot
      - AUTH_TRUST_HOST=https://$url_typebot

      ## Plano Padrão (das novas contas)
      - DEFAULT_WORKSPACE_PLAN=UNLIMITED

      ## Urls do typebot
      - NEXTAUTH_URL=https://$url_typebot ## URL Builder
      - NEXT_PUBLIC_VIEWER_URL=https://$url_viewer ## URL Viewer
      - NEXTAUTH_URL_INTERNAL=http://localhost:3000

      ## Desativer/ativar novos cadastros
      - DISABLE_SIGNUP=false

      ## Dados do SMTP
      - ADMIN_EMAIL=$email_typebot ## Email SMTP
      - NEXT_PUBLIC_SMTP_FROM='Suporte' <$email_typebot>
      - SMTP_AUTH_DISABLED=false
      - SMTP_USERNAME=$usuario_email_typebot
      - SMTP_PASSWORD=$senha_email_typebot
      - SMTP_HOST=$smtp_email_typebot
      - SMTP_PORT=$porta_smtp_typebot
      - SMTP_SECURE=$smtp_secure_typebot

      ## Dados Google Cloud
      #- GOOGLE_AUTH_CLIENT_ID=
      #- GOOGLE_SHEETS_CLIENT_ID=
      #- GOOGLE_AUTH_CLIENT_SECRET=
      #- GOOGLE_SHEETS_CLIENT_SECRET=
      #- NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY=

      ## Dados do Minio/S3
      - S3_ACCESS_KEY=$S3_ACCESS_KEY
      - S3_SECRET_KEY=$S3_SECRET_KEY
      - S3_BUCKET=typebot${1:+-$1}
      - S3_ENDPOINT=$url_s3

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
        - io.portainer.accesscontrol.users=admin
        - traefik.enable=true
        - traefik.http.routers.typebot${1:+_$1}_builder.rule=Host(\`$url_typebot\`) ## Url do Builder do Typebot
        - traefik.http.routers.typebot${1:+_$1}_builder.entrypoints=websecure
        - traefik.http.routers.typebot${1:+_$1}_builder.tls.certresolver=letsencryptresolver
        - traefik.http.services.typebot${1:+_$1}_builder.loadbalancer.server.port=3000
        - traefik.http.services.typebot${1:+_$1}_builder.loadbalancer.passHostHeader=true
        - traefik.http.routers.typebot${1:+_$1}_builder.service=typebot${1:+_$1}_builder

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  typebot${1:+_$1}_viewer:
    image: baptistearno/typebot-viewer:latest ## Versão do Viewer do Typebot

    networks:
      - $nome_rede_interna ## Nome da rede interna

    environment:
      ## Dados do Postgres
      - DATABASE_URL=postgresql://postgres:$senha_postgres@postgres:5432/typebot${1:+_$1}

      ## Encryption key
      - ENCRYPTION_SECRET=$key_typebot
      - AUTH_TRUST_HOST=https://$url_typebot

      ## Plano Padrão (das novas contas)
      - DEFAULT_WORKSPACE_PLAN=UNLIMITED

      ## Urls do typebot
      - NEXTAUTH_URL=https://$url_typebot ## URL Builder
      - NEXT_PUBLIC_VIEWER_URL=https://$url_viewer ## URL Viewer
      - NEXTAUTH_URL_INTERNAL=http://localhost:3000

      ## Desativer/ativar novos cadastros
      - DISABLE_SIGNUP=false

      ## Dados do SMTP
      - ADMIN_EMAIL=$email_typebot ## Email SMTP
      - NEXT_PUBLIC_SMTP_FROM='Suporte' <$email_typebot>
      - SMTP_AUTH_DISABLED=false
      - SMTP_USERNAME=$usuario_email_typebot
      - SMTP_PASSWORD=$senha_email_typebot
      - SMTP_HOST=$smtp_email_typebot
      - SMTP_PORT=$porta_smtp_typebot
      - SMTP_SECURE=$smtp_secure_typebot

      ## Dados Google Cloud
      #- GOOGLE_AUTH_CLIENT_ID=
      #- GOOGLE_SHEETS_CLIENT_ID=
      #- GOOGLE_AUTH_CLIENT_SECRET=
      #- GOOGLE_SHEETS_CLIENT_SECRET=
      #- NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY=

      ## Dados do Minio/S3
      - S3_ACCESS_KEY=$S3_ACCESS_KEY
      - S3_SECRET_KEY=$S3_SECRET_KEY
      - S3_BUCKET=typebot${1:+-$1}
      - S3_ENDPOINT=$url_s3

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
        - io.portainer.accesscontrol.users=admin
        - traefik.enable=true
        - traefik.http.routers.typebot${1:+_$1}_viewer.rule=Host(\`$url_viewer\`) ## Url do Viewer do Typebot
        - traefik.http.routers.typebot${1:+_$1}_viewer.entrypoints=websecure
        - traefik.http.routers.typebot${1:+_$1}_viewer.tls.certresolver=letsencryptresolver
        - traefik.http.services.typebot${1:+_$1}_viewer.loadbalancer.server.port=3000
        - traefik.http.services.typebot${1:+_$1}_viewer.loadbalancer.passHostHeader=true
        - traefik.http.routers.typebot${1:+_$1}_viewer.service=typebot${1:+_$1}_viewer

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

networks:
  $nome_rede_interna: ## Nome da rede interna
    external: true
    name: $nome_rede_interna ## Nome da rede interna
EOL

if [ $? -eq 0 ]; then
    echo -e "Passo \e[33m1/10\e[0m ✅ - Stack do Typebot criada com sucesso"
else
    echo -e "Passo \e[33m1/10\e[0m ❌ [\e[31mFALHOU\e[0m] - Falha ao criar a stack do Typebot"
    echo -e "⚠️ \e[33mNão foi possível criar a stack do Typebot.\e[0m"
fi

STACK_NAME="typebot${1:+_$1}"
stack_editavel 

echo -e "\e[97m🔍 Verificando o serviço...\e[33m [Etapa 5 de 5]\e[0m"
echo ""
sleep 1

pull baptistearno/typebot-builder:latest baptistearno/typebot-viewer:latest

wait_stack typebot${1:+_$1}_typebot${1:+_$1}_builder typebot${1:+_$1}_typebot${1:+_$1}_viewer

cd dados_vps
cat > dados_typebot${1:+_$1} <<EOL
[ Typebot ]

Dominio do Builder: https://$url_typebot

Dominio do Viewer: https://$url_viewer

EOL

cd
cd

wait_30_sec

msg_resumo_informacoes
echo -e "\e[32m🔹 [ TYPEBOT ]\e[0m"
echo ""

echo -e "\e[33m🌐 Domínio:\e[97m https://$url_typebot\e[0m"
echo ""

echo -e "\e[33m📧 E-mail:\e[97m Qualquer um (não precisa ser o mesmo da instalação)\e[0m"
echo ""

echo -e "\e[33m🔑 Acesso:\e[97m Sem senha — um link mágico será enviado pro seu e-mail.\e[0m"

msg_retorno_menu

}

ferramenta_directus(){

msg_directus

dados

while true; do
    ## Passo 1
    echo -e "\n📍 \e[97mPasso ${amarelo}1/7\e[0m"
    echo -en "🔗 \e[33mDigite o domínio para o Directus (ex: direto.encha.ai): \e[0m" && read -r url_directus

    ## Passo 2
    echo -e "\n📍 \e[97mPasso ${amarelo}2/7\e[0m"
    echo -en "📧 \e[33mDigite o Email de Admin (ex: instalador@encha.ai): \e[0m" && read -r email_directus

    ## Passo 3
    echo -e "\n📍 \e[97mPasso ${amarelo}3/7\e[0m"
    echo -e "🔒 \e[33m--> Sem caracteres especiais: \!#$"
    echo -en "🔑 Digite a Senha para o Admin (ex: @Senha123_): \e[0m" && read -r senha_directus

    ## Passo 4
    echo -e "\n📍 \e[97mPasso ${amarelo}4/7\e[0m"
    echo -en "📨 \e[33mDigite o Email SMTP (ex: instalador@encha.ai): \e[0m" && read -r email_smtp_directus

    ## Passo 5
    echo -e "\n📍 \e[97mPasso ${amarelo}5/7\e[0m"
    echo -e "🔑 \e[33m--> Sem caracteres especiais: \!#$ | Se usar Gmail, utilize a senha de app"
    echo -en "📬 Digite a Senha SMTP (ex: @Senha123_): \e[0m" && read -r senha_smtp_directus

    ## Passo 6
    echo -e "\n📍 \e[97mPasso ${amarelo}6/7\e[0m"
    echo -en "🌐 \e[33mDigite o Host SMTP (ex: smtp.hostinger.com): \e[0m" && read -r host_smtp_directus

    ## Passo 7
    echo -e "\n📍 \e[97mPasso ${amarelo}7/7\e[0m"
    echo -en "🔌 \e[33mDigite a Porta SMTP (ex: 465): \e[0m" && read -r porta_smtp_directus

    ## Ajusta SSL
    if [ "$porta_smtp_directus" -eq 465 ]; then
        ssl_smtp_directus=true
    else
        ssl_smtp_directus=false
    fi

    ## Revisão das informações
    clear
    
    msg_directus
    echo ""
    echo -e "\e[33m🔍 Por favor, revise as informações abaixo:\e[0m\n"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "🌐 \e[33mDomínio do Directus:\e[97m $url_directus\e[0m"
    echo -e "👤 \e[33mEmail de Admin:\e[97m $email_directus\e[0m"
    echo -e "🔑 \e[33mSenha de Admin:\e[97m $senha_directus\e[0m"
    echo -e "📨 \e[33mEmail SMTP:\e[97m $email_smtp_directus\e[0m"
    echo -e "🔒 \e[33mSenha SMTP:\e[97m $senha_smtp_directus\e[0m"
    echo -e "🌐 \e[33mHost SMTP:\e[97m $host_smtp_directus\e[0m"
    echo -e "🔌 \e[33mPorta SMTP:\e[97m $porta_smtp_directus\e[0m"
    echo -e "🔐 \e[33mSSL Ativado:\e[97m $ssl_smtp_directus\e[0m"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    ## Confirmação
    read -p $'\e[32m✅ As respostas estão corretas?\e[0m \e[33m(Y/N)\e[0m: ' confirmacao
    if [[ "$confirmacao" =~ ^[Yy]$ ]]; then
        clear
        break
    else
        msg_directus
    fi
done


echo -e "\e[97m🎯 Iniciando a instalação do Directus... \e[33m[Etapa 1 de 6]\e[0m"

echo -e "\e[97m📦 Verificando ou instalando o Postgres...\e[33m [Etapa 2 de 6]\e[0m"
echo ""
sleep 1


verificar_container_postgres
if [ $? -eq 0 ]; then
    echo "✅ 1/3 - Postgres já está instalado."
    pegar_senha_postgres > /dev/null 2>&1
    echo "🔐 2/3 - Senha do Postgres copiada com sucesso."
    criar_banco_postgres_da_stack "directus${1:+_$1}"
    echo "🛠️  3/3 - Banco de dados 'directus${1:+_$1}' criado com sucesso."
    echo ""
else
    ferramenta_postgres
    pegar_senha_postgres > /dev/null 2>&1
    criar_banco_postgres_da_stack "directus${1:+_$1}"
fi

echo -e "\e[97m📦 Verificando ou instalando o Redis...\e[33m [Etapa 3 de 6]\e[0m"
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


echo -e "\e[97m📂 Criando bucket no MinIO \e[33m[4/6]\e[0m"
echo ""
sleep 1

pegar_senha_minio
criar_bucket.minio directus${1:+-$1} > /dev/null 2

echo -e "\e[97m🚀 INSTALANDO DIRECTUS \e[33m[5/6]\e[0m"
echo ""
sleep 1

key_directus=$(openssl rand -hex 16)
key_directus2=$(openssl rand -hex 16)

cat > directus${1:+_$1}.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  directus${1:+_$1}:
    image: directus/directus:latest

    volumes:
      - directus${1:+_$1}_uploads:/directus/uploads
      - directus${1:+_$1}_data:/directus/database

    networks:
      - $nome_rede_interna

    environment:
      ## Dados de acesso
      - ADMIN_EMAIL=$email_directus
      - ADMIN_PASSWORD=$senha_directus
      - PUBLIC_URL=https://$url_directus

      ## Dados SMTP
      - EMAIL_SMTP_USER=$email_smtp_directus
      - EMAIL_SMTP_PASSWORD=$senha_smtp_directus
      - EMAIL_SMTP_HOST=$host_smtp_directus
      - EMAIL_SMTP_PORT=$porta_smtp_directus
      - EMAIL_SMTP_SECURE=$ssl_smtp_directus

      ## Dados MinIO
      - STORAGE_s3_KEY=$S3_ACCESS_KEY
      - STORAGE_s3_SECRET=$S3_SECRET_KEY
      - STORAGE_s3_BUCKET=directus${1:+-$1}
      - STORAGE_s3_REGION=eu-south
      - STORAGE_s3_ENDPOINT=$url_s3

      ## Redis
      - REDIS=redis://redis:6379/4

      ## Secret Keys & Env
      - KEY=$key_directus
      - SECRET=$key_directus2
      - APP_ENV=production

      ## Dados Postgres
      - DB_CLIENT=postgres
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_DATABASE=directus${1:+_$1}
      - DB_USER=postgres
      - DB_PASSWORD=$senha_postgres
      - DB_CONNECTION_STRING=postgresql://postgres:$senha_postgres@postgres:5432/directus${1:+_$1}
      - DB_PREFIX=drcts_

    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.directus${1:+_$1}.rule=Host(\`$url_directus\`)
        - traefik.http.services.directus${1:+_$1}.loadbalancer.server.port=8055
        - traefik.http.routers.directus${1:+_$1}.service=directus${1:+_$1}
        - traefik.http.routers.directus${1:+_$1}.tls.certresolver=letsencryptresolver
        - traefik.http.routers.directus${1:+_$1}.entrypoints=websecure
        - traefik.http.routers.directus${1:+_$1}.tls=true

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

volumes:
  directus${1:+_$1}_uploads:
    external: true
    name: directus${1:+_$1}_uploads
  directus${1:+_$1}_data:
    external: true
    name: directus${1:+_$1}_data

networks:
  $nome_rede_interna:
    external: true
    attachable: true
    name: $nome_rede_interna
EOL
if [ $? -eq 0 ]; then
    echo -e "Passo \e[33m1/10\e[0m ✅ - Stack do Directus criada com sucesso"
else
    echo -e "Passo \e[33m1/10\e[0m ❌ [\e[31mFALHOU\e[0m] - Falha ao criar a stack do Directus"
    echo -e "⚠️ \e[33mNão foi possível criar a stack do Directus.\e[0m"
fi

STACK_NAME="directus${1:+_$1}"
stack_editavel

echo -e "\e[97m🔍 Verificando o serviço...\e[33m [Etapa 6 de 6]\e[0m"
echo ""
sleep 1

pull directus/directus:latest

wait_stack directus${1:+_$1}_directus${1:+_$1}

cd dados_vps
cat > dados_directus${1:+_$1} <<EOL
[ Directus ]
Dominio do Directus: https://$url_directus

Usuário Admin: $email_directus

Senha Admin: $senha_directus

EOL

cd
cd

wait_30_sec

msg_resumo_informacoes
echo -e "\e[32m🚀 [ DIRECTUS ]\e[0m"
echo ""

echo -e "\e[33m🌐 Domínio:\e[97m https://$url_directus\e[0m"
echo ""

echo -e "\e[33m👤 Usuário:\e[97m $email_directus\e[0m"
echo ""

echo -e "\e[33m🔑 Senha:\e[97m $senha_directus\e[0m"
echo ""

msg_retorno_menu
}

ferramenta_odoo(){
  msg_odoo
  
  dados

while true; do


    echo -en "\e[33m🌐 Digite o domínio para o Odoo (ex: doo.encha.ai): \e[0m" && read -r url_odoo
    echo ""


    ## Informação do domínio
    msg_odoo
    echo ""
    echo -e "\e[33m🔍 Por favor, revise as informações abaixo:\e[0m\n"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "\e[33m📍 Domínio para o Odoo:\e[97m $url_odoo\e[0m"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    ## Pergunta se as respostas estão corretas
    read -p $'\e[32m✅ As respostas estão corretas?\e[0m \e[33m(Y/N)\e[0m: ' confirmacao
    if [[ "$confirmacao" == [Yy] ]]; then

        ## Confirmou que está correto
        clear
        instalando_msg
        break
    else
        ## Se respondeu não, mostra mensagem e volta para o loop
        msg_odoo
    fi
done

echo -e "\e[97m🎯 Iniciando a instalação do Odoo... \e[33m[Etapa 1 de 3]\e[0m"

## Mensagem de Passo
echo -e "\e[97m• INSTALANDO ODOO \e[33m[2/3]\e[0m"
echo ""
sleep 1

## Criando senha do postgres
senha_postgres_odoo=$(openssl rand -hex 16)

## Criando a stack odoo.yaml
cat > odoo${1:+_$1}.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  odoo${1:+_$1}_app:
    image: odoo:18.0

    volumes:
      - odoo${1:+_$1}_app_data:/var/lib/odoo
      - odoo${1:+_$1}_app_config:/etc/odoo
      - odoo${1:+_$1}_app_addons:/mnt/extra-addons

    networks:
      - $nome_rede_interna

    environment:
      ## Dados postgres do Odoo
      - HOST=odoo${1:+_$1}_db
      - USER=odoo
      - PASSWORD=$senha_postgres_odoo

    deploy:
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.odoo${1:+_$1}_app.rule=Host(\`$url_odoo\`)
        - traefik.http.routers.odoo${1:+_$1}_app.entrypoints=websecure
        - traefik.http.routers.odoo${1:+_$1}_app.tls=true
        - traefik.http.routers.odoo${1:+_$1}_app.service=odoo${1:+_$1}_app
        - traefik.http.routers.odoo${1:+_$1}_app.tls.certresolver=letsencryptresolver
        - traefik.http.services.odoo${1:+_$1}_app.loadbalancer.server.port=8069

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  odoo${1:+_$1}_db:
    image: postgres:15

    volumes:
      - odoo${1:+_$1}_db_data:/var/lib/postgresql/data/pgdata

    networks:
      - $nome_rede_interna
    #ports:
    #  - 5434:5432

    environment:
      ## Dados Postgres
      - POSTGRES_DB=postgres
      - POSTGRES_PASSWORD=$senha_postgres_odoo
      - POSTGRES_USER=odoo
      - PGDATA=/var/lib/postgresql/data/pgdata
    deploy:
      placement:
        constraints:
          - node.role == manager

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

volumes:
  odoo${1:+_$1}_app_data:
    external: true
    name: odoo${1:+_$1}_app_data
  odoo${1:+_$1}_app_config:
    external: true
    name: odoo${1:+_$1}_app_config
  odoo${1:+_$1}_app_addons:
    external: true
    name: odoo${1:+_$1}_app_addons
  odoo${1:+_$1}_db_data:
    external: true
    name: odoo${1:+_$1}_db_data

networks:
  $nome_rede_interna:
    external: true
    attachable: true
    name: $nome_rede_interna
EOL
if [ $? -eq 0 ]; then
    echo -e "\e[32m1/10 - ✅ [OK] - Criando Stack\e[0m"
else
    echo -e "\e[31m1/10 - ❌ [OFF] - Criando Stack\e[0m"
    echo -e "\e[31m⚠️ Não foi possível criar a stack do Odoo\e[0m"
fi
STACK_NAME="odoo${1:+_$1}"
stack_editavel


echo -e "Passo \e[33m3/3\e[0m 🔍 • VERIFICANDO SERVIÇO"
echo ""
sleep 1

pull odoo:18.0 postgres:15

wait_stack odoo${1:+_$1}_odoo${1:+_$1}_app odoo${1:+_$1}_odoo${1:+_$1}_db

cd dados_vps
cat > dados_odoo${1:+_$1} <<EOL
[ Odoo ]

Dominio do Odoo: https://$url_odoo

Senha do Postgres Odoo: $senha_postgres_odoo

EOL

cd
cd

wait_30_sec

msg_resumo_informacoes
echo -e "\e[32m🟢 [ ODOO ]\e[0m"
echo ""

echo -e "\e[33m🌐 Dominio:\e[97m https://$url_odoo\e[0m"
echo ""

echo -e "\e[33m👤 Usuario:\e[97m Precisa criar no primeiro acesso do Odoo\e[0m"
echo ""

echo -e "\e[33m🔑 Senha:\e[97m Precisa criar no primeiro acesso do Odoo\e[0m"
echo ""

echo -e "\e[33m🗄️ Database Name:\e[97m odoo\e[0m"
echo ""

echo -e "\e[33m🔒 Database Password:\e[97m $senha_postgres_odoo\e[0m"

echo ""
msg_retorno_menu
}

ferramenta_pgadmin() {
  msg_pgAdmin
  read -p "Iniciando instalação do PgAdmin 4... Pressione enter para continuar"
  dados

  while true; do
    read -p "Digite o domínio para o PgAdmin 4 (ex: pgadmin.encha.ai): " url_pgadmin
    read -p "Digite um email para o PgAdmin 4: " user_pgadmin
    read -s -p "Digite uma senha para o usuário: " pass_pgadmin
    echo ""

    # Validação
    if [[ -n "$url_pgadmin" && -n "$user_pgadmin" && -n "$pass_pgadmin" ]]; then
      break
    else
      echo "Todos os campos são obrigatórios. Tente novamente"
    fi
  done

  echo -e "🔧 \e[97mInstalando o PgAdmin 4... \e[33m[1/2]\e[0m"
  cat > pgadmin.yaml << EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  pgadmin:
    image: dpage/pgadmin4:latest
    environment:
      PGADMIN_DEFAULT_EMAIL: ${user_pgadmin}
      PGADMIN_DEFAULT_PASSWORD: ${pass_pgadmin}
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    networks:
      - ${nome_rede_interna}
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.pgadmin.rule=Host(\`${url_pgadmin}\`)"
        - "traefik.http.services.pgadmin.loadbalancer.server.port=80"
        - "traefik.http.routers.pgadmin.entrypoints=websecure"
        - "traefik.http.routers.pgadmin.tls.certresolver=letsencryptresolver"
volumes:
  pgadmin_data:
networks:
  ${nome_rede_interna}:
    external: true
EOL

  STACK_NAME="pgadmin"
  stack_editavel

  echo -e "⏳ \e[97mVerificando serviço... \e[33m[2/2]\e[0m"
  pull dpage/pgadmin4:latest
  wait_stack pgadmin_pgadmin

  cd /root/dados_vps
  cat > dados_pgadmin <<EOL
[ PGADMIN 4 ]

Dominio do PgAdmin: https://${url_pgadmin}
Usuario: ${user_pgadmin}
Senha: ${pass_pgadmin}
EOL

  cd

  # Salvar informações e resumo
  msg_resumo_informacoes
  echo "✅ PgAdmin 4 instalado com sucesso!"
  echo "Acesse em: https://${url_pgadmin}"
  echo "Usuário: ${user_pgadmin}"
  echo "Senha: [sua_senha_digitada]"

  msg_retorno_menu
}

ferramenta_nocobase() {
  msg_nocobase
  dados

  while true; do
    echo -e "\n📍 \e[97mPasso ${amarelo}1/4\e[0m"
    echo -en "🔗 \e[33mDigite o domínio para o NocoBase (ex: nocobase.encha.ai): \e[0m" && read -r url_nocobase
    echo -e "\n📍 \e[97mPasso ${amarelo}2/4\e[0m"
    echo -en "📧 \e[33mDigite um email para o NocoBase (ex: admin@encha.ai): \e[0m" && read -r mail_nocobase
    echo -e "\n📍 \e[97mPasso ${amarelo}3/4\e[0m"
    echo -en "👤 \e[33mDigite um nome de usuário (ex: EnchaAdmin): \e[0m" && read -r user_nocobase
    echo -e "\n📍 \e[97mPasso ${amarelo}4/4\e[0m"
    echo -en "🔑 \e[33mDigite uma senha para o usuário: \e[0m" && read -s -r pass_nocobase
    echo ""

    clear
    msg_resumo_informacoes
    echo -e "\e[33m🔍 Por favor, revise as informações abaixo:\e[0m\n"
    echo -e "🌐 \e[33mDomínio:\e[97m $url_nocobase\e[0m"
    echo -e "📧 \e[33mEmail:\e[97m $mail_nocobase\e[0m"
    echo -e "👤 \e[33mUsuário:\e[97m $user_nocobase\e[0m"
    read -p $'\n\e[32m✅ As respostas estão corretas?\e[0m \e[33m(Y/N)\e[0m: ' confirmacao
    if [[ "$confirmacao" =~ ^[Yy]$ ]]; then break; else msg_nocobase; fi
  done

  msg_status
  echo -e "\e[97m🚀 Iniciando a instalação do NocoBase...\e[0m"
  verificar_container_postgres || ferramenta_postgres
  pegar_senha_postgres
  criar_banco_postgres_da_stack "nocobase"

  cat > nocobase.yaml << EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  nocobase:
    image: nocobase/nocobase:latest
    volumes:
      - nocobase_storage:/app/nocobase/storage
    networks:
      - ${nome_rede_interna}
    environment:
      - INIT_ROOT_EMAIL=${mail_nocobase}
      - INIT_ROOT_PASSWORD=${pass_nocobase}
      - INIT_ROOT_NICKNAME=${user_nocobase}
      - DB_DIALECT=postgres
      - DB_HOST=postgres
      - DB_DATABASE=nocobase
      - DB_USER=postgres
      - DB_PASSWORD=${senha_postgres}
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.nocobase.rule=Host(\`${url_nocobase}\`)"
        - "traefik.http.services.nocobase.loadbalancer.server.port=80"
        - "traefik.http.routers.nocobase.entrypoints=websecure"
        - "traefik.http.routers.nocobase.tls.certresolver=letsencryptresolver"
volumes:
  nocobase_storage:
networks:
  ${nome_rede_interna}:
    external: true
EOL

  STACK_NAME="nocobase"
  stack_editavel
  wait_stack nocobase_nocobase

  cd /root/dados_vps
  cat > dados_nocobase <<EOL
[ NOCOBASE ]

Dominio: https://${url_nocobase}
Email: ${mail_nocobase}
Usuario: ${user_nocobase}
Senha: ${pass_nocobase}
EOL

  cd

  msg_resumo_informacoes
  echo "✅ NocoBase instalado com sucesso!"
  echo "Acesse em: https://${url_nocobase}"
  echo "Email: ${mail_nocobase}"
  msg_retorno_menu

}

ferramenta_botpress(){
  msg_botpress
  dados

  read -p $'\e[33mDigite o domínio para o Botpress (ex: botpress.encha.ai): \e[0m' url_botpress
  echo -e "\e[97m🚀 Iniciando a instalação do Botpress...\e[0m"
  verificar_container_postgres || ferramenta_postgres
  pegar_senha_postgres
  criar_banco_postgres_da_stack "botpress"

  verificar_container_redis || ferramenta_redis
  cat > botpress.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  botpress:
    image: botpress/server:latest
    volumes:
      - botpress_data:/botpress/data
    networks:
      - ${nome_rede_interna}
    environment:
      - EXTERNAL_URL=https://${url_botpress}
      - BP_PRODUCTION=true
      - DATABASE_URL=postgresql://postgres:${senha_postgres}@postgres:5432/botpress
      - REDIS_URL=redis://redis:6379
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.botpress.rule=Host(\`${url_botpress}\`)"
        - "traefik.http.services.botpress.loadbalancer.server.port=3000"
        - "traefik.http.routers.botpress.entrypoints=websecure"
        - "traefik.http.routers.botpress.tls.certresolver=letsencryptresolver"
volumes:
  botpress_data:
networks:
  ${nome_rede_interna}:
    external: true
EOL

  STACK_NAME="botpress"
  stack_editavel
  wait_stack botpress_botpress

  cd /root/dados_vps
  cat > dados_botpress <<EOL

[ BOTPRESS ]

Dominio: https://${url_botpress}
Usuario: (criado no primeiro acesso)
Senha: (criada no primeiro acesso)
EOL

  cd

  msg_resumo_informacoes
  echo "✅ Botpress instalado com sucesso!"
  echo "Acesse em: https://${url_botpress}"
  echo "Crie seu usuário no primeiro acesso."
  msg_retorno_menu

}

ferramenta_baserow(){
  msg_baserow
  dados

  read -p $'\e[33mDigite o domínio para o Baserow (ex: baserow.encha.ai): \e[0m' url_baserow

  echo -e "\e[97m🚀 Iniciando a instalação do Baserow...\e[0m"
  verificar_container_postgres || ferramenta_postgres
  pegar_senha_postgres
  criar_banco_postgres_da_stack "baserow"

  cat > baserow.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  baserow:
    image: baserow/baserow:latest
    volumes:
      - baserow_data:/baserow/data
    networks:
      - ${nome_rede_interna}
    environment:
      - BASEROW_PUBLIC_URL=https://${url_baserow}
      - DATABASE_URL=postgresql://postgres:${senha_postgres}@postgres:5432/baserow
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.baserow.rule=Host(\`${url_baserow}\`)"
        - "traefik.http.services.baserow.loadbalancer.server.port=80"
        - "traefik.http.routers.baserow.entrypoints=websecure"
        - "traefik.http.routers.baserow.tls.certresolver=letsencryptresolver"
volumes:
  baserow_data:
networks:
  ${nome_rede_interna}:
    external: true
EOL

  STACK_NAME="baserow"
  stack_editavel
  wait_stack baserow_baserow

  cd /root/dados_vps
  cat > dados_baerow <<EOL
[ BASEROW ]

Dominio: https://${url_baserow}
Usuario: (criado no primeiro acesso)
Senha: (criada no primeiro acesso)
EOL

  cd

  msg_resumo_informacoes
  echo "✅ Baserow instalado com sucesso!"
  echo "Acesse em: https://${url_baserow}"
  echo "Crie seu usuário no primeiro acesso."
  msg_retorno_menu
}

ferramenta_mongodb(){
  msg_mongodb
  dados

  while true; do
    echo -e "\n📍 \e[97mPasso ${amarelo}1/1\e[0m"
    echo -en "👤 \e[33mDigite o nome de usuário para o MongoDB (ex: encha_user): \e[0m" && read -r user_mongo

    # Gera a senha aleatória
    pass_mongo=$(openssl rand -hex 16)

    clear
    msg_mongodb
    echo -e "\e[33m🔍 Por favor, revise as informações abaixo:\e[0m\n"
    echo -e "👤 \e[33mUsuário:\e[97m $user_mongo\e[0m"
    echo -e "🔑 \e[33mSenha Gerada:\e[97m $pass_mongo (esta senha será usada na instalação)\e[0m"
    read -p $'\n\e[32m✅ As informações estão corretas?\e[0m \e[33m(Y/N)\e[0m: ' confirmacao
    if [[ "$confirmacao" =~ ^[Yy]$ ]]; then break; else msg_mongodb; fi
  done

  echo -e "\e[97m🚀 Iniciando a instalação do MongoDB...\e[0m"

  cat > mongodb.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  mongodb:
    image: mongo:latest
    volumes:
      - mongodb_data:/data/db
    networks:
      - ${nome_rede_interna}
    ports:
      - "27017:27017" # Expondo a porta para acesso externo, se necessário
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${user_mongo}
      - MONGO_INITDB_ROOT_PASSWORD=${pass_mongo}
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 2048M
volumes:
  mongodb_data:
networks:
  ${nome_rede_interna}:
    external: true
EOL

  STACK_NAME="mongodb"
  stack_editavel
  wait_stack mongodb_mongodb

  read -r ip _ <<<"$(hostname -I)"

  cd /root/dados_vps
  cat > dados_mongodb <<EOL
[ MONGODB ]

Host: ${ip}
Porta: 27017
Usuario: ${user_mongo}
Senha: ${pass_mongo}
String de Conexão: mongodb://${user_mongo}:${pass_mongo}@${ip}:27017/?authSource=admin
EOL

  cd

  msg_resumo_informacoes
  echo "✅ MongoDB instalado com sucesso!"
  echo "Host: O IP do seu servidor (ex: $ip)"
  echo "Porta: 27017"
  echo "Usuário: ${user_mongo}"
  echo "Senha: ${pass_mongo}"
  msg_retorno_menu
}

ferramenta_rabbitmq(){
  msg_rabbitmq
  dados
  
  while true; do
    echo -e "\n📍 \e[97mPasso ${amarelo}1/2\e[0m"
    echo -en "🔗 \e[33mDigite o domínio para o painel do RabbitMQ (ex: rabbit.encha.ai): \e[0m" && read -r url_rabbitmq
    echo -e "\n📍 \e[97mPasso ${amarelo}2/2\e[0m"
    echo -en "👤 \e[33mDigite um nome de usuário (ex: encha_user): \e[0m" && read -r user_rabbitmq

    pass_rabbitmq=$(openssl rand -hex 16)

    clear
    msg_rabbitmq
    echo -e "\e[33m🔍 Por favor, revise as informações abaixo:\e[0m\n"
    echo -e "🌐 \e[33mDomínio:\e[97m $url_rabbitmq\e[0m"
    echo -e "👤 \e[33mUsuário:\e[97m $user_rabbitmq\e[0m"
    echo -e "🔑 \e[33mSenha Gerada:\e[97m $pass_rabbitmq\e[0m"
    read -p $'\n\e[32m✅ As informações estão corretas?\e[0m \e[33m(Y/N)\e[0m: ' confirmacao
    if [[ "$confirmacao" =~ ^[Yy]$ ]]; then break; else msg_rabbitmq; fi
  done

  echo -e "\e[97m🚀 Iniciando a instalação do RabbitMQ...\e[0m"
  key_cookie=$(openssl rand -hex 16)

  cat > rabbitmq.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  rabbitmq:
    image: rabbitmq:management
    hostname: rabbitmq
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    networks:
      - ${nome_rede_interna}
    environment:
      RABBITMQ_DEFAULT_USER: ${user_rabbitmq}
      RABBITMQ_DEFAULT_PASS: ${pass_rabbitmq}
      RABBITMQ_ERLANG_COOKIE: ${key_cookie}
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.rabbitmq.rule=Host(\`${url_rabbitmq}\`)"
        - "traefik.http.services.rabbitmq.loadbalancer.server.port=15672"
        - "traefik.http.routers.rabbitmq.entrypoints=websecure"
        - "traefik.http.routers.rabbitmq.tls.certresolver=letsencryptresolver"
volumes:
  rabbitmq_data:
networks:
  ${nome_rede_interna}:
    external: true
EOL

  STACK_NAME="rabbitmq"
  stack_editavel
  wait_stack rabbitmq_rabbitmq

  cd /root/dados_vps
  cat > dados_rabbitmq <<EOL
[ RABBITMQ ]

Dominio do Painel: https://${url_rabbitmq}
Usuario: ${user_rabbitmq}
Senha: ${pass_rabbitmq}
URL de Conexão: amqp://${user_rabbitmq}:${pass_rabbitmq}@rabbitmq:5672
EOL

  cd

  msg_resumo_informacoes
  echo "✅ RabbitMQ instalado com sucesso!"
  echo "Acesse o painel em: https://${url_rabbitmq}"
  echo "Usuário: ${user_rabbitmq}"
  echo "Senha: ${pass_rabbitmq}"
  echo "URL de conexão: amqp://${user_rabbitmq}:${pass_rabbitmq}@rabbitmq:5672"
  msg_retorno_menu

}

ferramenta_uptimekuma(){
  msg_uptimekuma
  dados

  read -p $'\e[33mDigite o domínio para o Uptime Kuma (ex: status.encha.ai): \e[0m' url_uptimekuma
  
  echo -e "\e[97m🚀 Iniciando a instalação do Uptime Kuma...\e[0m"

  cat > uptimekuma.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  uptimekuma:
    image: louislam/uptime-kuma:latest
    volumes:
      - uptimekuma_data:/app/data
    networks:
      - ${nome_rede_interna}
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.uptimekuma.rule=Host(\`${url_uptimekuma}\`)"
        - "traefik.http.services.uptimekuma.loadbalancer.server.port=3001"
        - "traefik.http.routers.uptimekuma.entrypoints=websecure"
        - "traefik.http.routers.uptimekuma.tls.certresolver=letsencryptresolver"
volumes:
  uptimekuma_data:
networks:
  ${nome_rede_interna}:
    external: true
EOL

  STACK_NAME="uptimekuma"
  stack_editavel
  wait_stack uptimekuma_uptimekuma

  cd /root/dados_vps
  cat > dados_uptimekuma <<EOL
[ UPTIME KUMA ]

Dominio: https://${url_uptimekuma}
Usuario: (criado no primeiro acesso)
Senha: (criada no primeiro acesso)
EOL

  cd

  msg_resumo_informacoes
  echo "✅ Uptime Kuma instalado com sucesso!"
  echo "Acesse em: https://${url_uptimekuma}"
  echo "Crie seu usuário no primeiro acesso."
  msg_retorno_menu

}

ferramenta_calcom() {
    msg_calcom
    dados

    while true; do
        echo -e "\n📍 \e[97mPasso ${amarelo}1/6\e[0m"
        echo -en "🔗 \e[33mDigite o domínio para o Cal.com (ex: cal.encha.ai): \e[0m" && read -r url_calcom
        echo -e "\n📍 \e[97mPasso ${amarelo}2/6\e[0m"
        echo -en "📧 \e[33mDigite o Email para SMTP (ex: noreply@encha.ai): \e[0m" && read -r email_calcom
        echo -e "\n📍 \e[97mPasso ${amarelo}3/6\e[0m"
        echo -en "👤 \e[33mDigite o Usuário para SMTP (pode ser o mesmo email): \e[0m" && read -r user_calcom
        echo -e "\n📍 \e[97mPasso ${amarelo}4/6\e[0m"
        echo -en "🔑 \e[33mDigite a Senha SMTP do email: \e[0m" && read -s -r senha_email_calcom
        echo ""
        echo -e "\n📍 \e[97mPasso ${amarelo}5/6\e[0m"
        echo -en "🏠 \e[33mDigite o Host SMTP do email (ex: smtp.hostinger.com): \e[0m" && read -r smtp_email_calcom
        echo -e "\n📍 \e[97mPasso ${amarelo}6/6\e[0m"
        echo -en "🔌 \e[33mDigite a porta SMTP do email (ex: 465 ou 587): \e[0m" && read -r porta_smtp_calcom

        clear
        msg_calcom
        echo -e "\e[33m🔍 Por favor, revise as informações abaixo:\e[0m\n"
        echo -e "🌐 \e[33mDomínio:\e[97m $url_calcom\e[0m"
        echo -e "📧 \e[33mEmail SMTP:\e[97m $email_calcom\e[0m"
        echo -e "👤 \e[33mUsuário SMTP:\e[97m $user_calcom\e[0m"
        echo -e "🌐 \e[33mHost SMTP:\e[97m $smtp_email_calcom\e[0m"
        echo -e "🔌 \e[33mPorta SMTP:\e[97m $porta_smtp_calcom\e[0m"
        read -p $'\n\e[32m✅ As respostas estão corretas?\e[0m \e[33m(Y/N)\e[0m: ' confirmacao
        if [[ "$confirmacao" =~ ^[Yy]$ ]]; then break; else msg_calcom; fi
    done

    echo -e "\e[97m🚀 Iniciando a instalação do Cal.com...\e[0m"
    verificar_container_postgres || ferramenta_postgres
    pegar_senha_postgres
    criar_banco_postgres_da_stack "calcom"

    secret=$(openssl rand -hex 32)

    cat > calcom.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  calcom:
    image: calcom/cal.com:latest
    command: sh -c "yarn prisma migrate deploy && yarn start"
    networks:
      - ${nome_rede_interna}
    environment:
      - NEXT_PUBLIC_WEBAPP_URL=https://${url_calcom}
      - DATABASE_DIRECT_URL=postgresql://postgres:${senha_postgres}@postgres:5432/calcom
      - DATABASE_URL=postgresql://postgres:${senha_postgres}@postgres:5432/calcom
      - NEXTAUTH_SECRET=${secret}
      - CALENDSO_ENCRYPTION_KEY=${secret}
      # Variáveis de SMTP agora estão sendo usadas
      - EMAIL_FROM=${email_calcom}
      - EMAIL_SERVER_USER=${user_calcom}
      - EMAIL_SERVER_PASSWORD=${senha_email_calcom}
      - EMAIL_SERVER_HOST=${smtp_email_calcom}
      - EMAIL_SERVER_PORT=${porta_smtp_calcom}
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.calcom.rule=Host(\`${url_calcom}\`)"
        - "traefik.http.services.calcom.loadbalancer.server.port=3000"
        - "traefik.http.routers.calcom.entrypoints=websecure"
        - "traefik.http.routers.calcom.tls.certresolver=letsencryptresolver"
networks:
  ${nome_rede_interna}:
    external: true
EOL

    STACK_NAME="calcom"
    stack_editavel
    wait_stack calcom_calcom

    cd /root/dados_vps
    cat > dados_calcom <<EOL
[ CAL.COM ]

Dominio: https://${url_calcom}
Usuario: (criado no primeiro acesso)
Senha: (criada no primeiro acesso)
EOL

    cd

    msg_resumo_informacoes
    echo "✅ Cal.com instalado com sucesso!"
    echo "Acesse em: https://${url_calcom}"
    echo "Crie seu usuário no primeiro acesso."
    msg_retorno_menu
}

ferramenta_mautic(){
  msg_mautic
  dados

  while true; do
    echo -e "\n📍 \e[97mPasso ${amarelo}1/4\e[0m"
    echo -en "🔗 \e[33mDigite o domínio para o Mautic (ex: mautic.encha.ai): \e[0m" && read -r url_mautic
    echo -e "\n📍 \e[97mPasso ${amarelo}2/4\e[0m"
    echo -en "👤 \e[33mDigite um usuário admin (ex: EnchaAdmin): \e[0m" && read -r user_mautic
    echo -e "\n📍 \e[97mPasso ${amarelo}3/4\e[0m"
    echo -en "📧 \e[33mDigite o email do admin (ex: admin@encha.ai): \e[0m" && read -r email_mautic
    echo -e "\n📍 \e[97mPasso ${amarelo}4/4\e[0m"
    echo -en "🔑 \e[33mDigite a senha do admin: \e[0m" && read -s -r senha_mautic
    echo ""

    clear
    msg_mautic
    echo -e "\e[33m🔍 Por favor, revise as informações abaixo:\e[0m\n"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "🌐 \e[33mDomínio:\e[97m $url_mautic\e[0m"
    echo -e "👤 \e[33mUsuário Admin:\e[97m $user_mautic\e[0m"
    echo -e "📧 \e[33mEmail Admin:\e[97m $email_mautic\e[0m"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    read -p $'\n\e[32m✅ As respostas estão corretas?\e[0m \e[33m(Y/N)\e[0m: ' confirmacao
    if [[ "$confirmacao" =~ ^[Yy]$ ]]; then break; else msg_mautic; fi
  done

  echo -e "\e[97m🚀 Iniciando a instalação do Mautic...\e[0m"
  verificar_container_mysql || ferramenta_mysql
  pegar_senha_mysql_da_stack 
  criar_banco_mysql_da_stack "mautic"
  
  # Continuar depois de criar as informações do mysql...
  cat > mautic.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  mautic_app:
    image: mautic/mautic:latest
    volumes:
      - mautic_data:/var/www/html
    networks:
      - ${nome_rede_interna}
    environment:
      - MAUTIC_DB_HOST=mysql
      - MAUTIC_DB_USER=root
      - MAUTIC_DB_PASSWORD=${senha_mysql}
      - MAUTIC_DB_NAME=mautic
      - MAUTIC_ADMIN_EMAIL=${email_mautic}
      - MAUTIC_ADMIN_USERNAME=${user_mautic}
      - MAUTIC_ADMIN_PASSWORD=${senha_mautic}
      - MAUTIC_TRUSTED_PROXIES=["0.0.0.0/0"]
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.mautic.rule=Host(\`${url_mautic}\`)"
        - "traefik.http.services.mautic.loadbalancer.server.port=80"
        - "traefik.http.routers.mautic.entrypoints=websecure"
        - "traefik.http.routers.mautic.tls.certresolver=letsencryptresolver"
volumes:
  mautic_data:
networks:
  ${nome_rede_interna}:
    external: true
EOL

  STACK_NAME="mautic"
  stack_editavel
  wait_stack mautic_mautic_app

  cd /root/dados_vps
  cat > dados_mautic <<EOL
[ MAUTIC ]

Dominio: https://${url_mautic}
Usuario Admin: ${user_mautic}
Email Admin: ${email_mautic}
Senha Admin: ${senha_mautic}
EOL

  cd

  msg_resumo_informacoes
  echo "✅ Mautic instalado com sucesso!"
  echo "Acesse em: https://${url_mautic}"
  echo "Usuário: ${user_mautic}"
  msg_retorno_menu

}

ferramenta_appsmith(){
  msg_appsmith
  dados

  read -p $'\e[33mDigite o domínio para o Appsmith (ex: apps.encha.ai): \e[0m' url_appsmith

  echo -e "\e[97m🚀 Iniciando a instalação do Appsmith...\e[0m"

  cat > appsmith.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  appsmith:
    image: appsmith/appsmith-ee:latest
    volumes:
      - appsmith_data:/appsmith-stacks
    networks:
      - ${nome_rede_interna}
    environment:
      - APPSMITH_CUSTOM_DOMAIN=https://${url_appsmith}
      - APPSMITH_SIGNUP_DISABLED=false
    deploy:
      resources:
        limits:
          cpus: "2"
          memory: 4096M
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.appsmith.rule=Host(\`${url_appsmith}\`)"
        - "traefik.http.services.appsmith.loadbalancer.server.port=80"
        - "traefik.http.routers.appsmith.entrypoints=websecure"
        - "traefik.http.routers.appsmith.tls.certresolver=letsencryptresolver"
volumes:
  appsmith_data:
networks:
  ${nome_rede_interna}:
    external: true
EOL

  STACK_NAME="appsmith"
  stack_editavel
  wait_stack appsmith_appsmith

  cd /root/dados_vps
  cat > dados_appsmith <<EOL
[ APPSMITH ]

Dominio: https://${url_appsmith}
Usuario: (criado no primeiro acesso)
Senha: (criada no primeiro acesso)
EOL

  cd

  msg_resumo_informacoes
  echo "✅ Appsmith instalado com sucesso!"
  echo "Acesse em: https://${url_appsmith}"
  echo "Crie seu usuário no primeiro acesso."
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

        echo -e "${azul}01.${reset} Instalar Traefik + Portainer                            ${azul}08.${reset} Instalar Typebot"
        echo -e "${azul}02.${reset} Instalar Evolution API                                  ${azul}09.${reset} Instalar Directus"
        echo -e "${azul}03.${reset} Instalar N8N                                            ${azul}10.${reset} Instalar Odoo "
        echo -e "${azul}04.${reset} Instalar Chatwoot                                       ${azul}11.${reset} Verificar status dos serviços"
        echo -e "${azul}05.${reset} Liberar Chatwoot                                        ${azul}12.${reset} Sair do menu"
        echo -e "${azul}06.${reset} Instalar N8N Formação Encha                             ${azul}13.${reset} Instalar pgAdmin"
        echo -e "${azul}07.${reset} Instalar Minio                                          ${azul}14.${reset} Instalar nocobase"
        echo -e "                                                                           ${azul}15.${reset} Instalar botpress"
        echo -e "                                                                           ${azul}16.${reset} Instalar baserow"
        echo -e "                                                                           ${azul}17.${reset} Instalar mongoDB"
        echo -e "                                                                           ${azul}18.${reset} Instalar rabbitMQ"
        echo -e "                                                                           ${azul}19.${reset} Instalar uptimeKuma"
        echo -e "                                                                           ${azul}20.${reset} Instalar calcom"
        echo -e "                                                                           ${azul}21.${reset} Instalar mautic"
        echo -e "                                                                           ${azul}22.${reset} Instalar appsmith"
        echo ""
        echo -en "${amarelo}👉 Escolha uma opção (1-20): ${reset}"
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
                if verificar_docker_e_portainer_traefik; then
                    liberar_chatwoot
                fi
                ;;
            06|6)
                verificar_stack "n8n_formacao_encha${opcao2:+_$opcao2}" && continue || echo ""

                if verificar_docker_e_portainer_traefik; then
                    ## INICIO TOKEN
                    STACK_NAME="n8n_formacao_encha${opcao2:+_$opcao2}"
                    if grep -q "Token: .\+" /root/dados_vps/dados_portainer; then
                        ferramenta_n8n_formacao_encha "$opcao2"
                    else
                        APP_ENCHA="ferramenta_n8n_formacao_encha"
                        verificar_arquivo
                    fi
                    ## FIM TOKEN 
                fi
                ;;
            07|7)
                verificar_stack "minio${opcao2:+_$opcao2}" && continue || echo ""

                if verificar_docker_e_portainer_traefik; then
                    ## INICIO TOKEN
                    STACK_NAME="minio${opcao2:+_$opcao2}"
                    if grep -q "Token: .\+" /root/dados_vps/dados_portainer; then
                        ferramenta_minio "$opcao2"
                    else
                        APP_ENCHA="ferramenta_minio"
                        verificar_arquivo
                    fi
                    ## FIM TOKEN 
                fi
                ;;    
            08|8)
                verificar_stack "typebot${opcao2:+_$opcao2}" && continue || echo ""
                 if verificar_docker_e_portainer_traefik && verificar_minio; then
                    ## INICIO TOKEN
                    STACK_NAME="typebot${opcao2:+_$opcao2}"
                    if grep -q "Token: .\+" /root/dados_vps/dados_portainer; then
                        ferramenta_typebot "$opcao2"
                    else
                        APP_ENCHA="ferramenta_typebot"
                        verificar_arquivo
                    fi
                    ## FIM TOKEN 
                fi
                ;;
            
            09|9)
                verificar_stack "directus${opcao2:+_$opcao2}" && continue || echo ""
                 if verificar_docker_e_portainer_traefik && verificar_minio; then
                    ## INICIO TOKEN
                    STACK_NAME="directus${opcao2:+_$opcao2}"
                    if grep -q "Token: .\+" /root/dados_vps/dados_portainer; then
                        ferramenta_directus "$opcao2"
                    else
                        APP_ENCHA="ferramenta_directus"
                        verificar_arquivo
                    fi
                    ## FIM TOKEN 
                fi        
                ;;
            
            10)
                verificar_stack "odoo${opcao2:+_$opcao2}" && continue || echo ""
                 if verificar_docker_e_portainer_traefik; then
                    ## INICIO TOKEN
                    STACK_NAME="odoo${opcao2:+_$opcao2}"
                    if grep -q "Token: .\+" /root/dados_vps/dados_portainer; then
                        ferramenta_odoo "$opcao2"
                    else
                        APP_ENCHA="ferramenta_odoo"
                        verificar_arquivo
                    fi
                fi
                ;;
            11)
                verificar_status_servicos
                echo "Aperte ENTER para retornar ao menu de ferramentas"
                read
                sleep 2                
                ;;
            12)
                echo -e "${verde}Saindo do menu...${reset}"
                sleep 1
                exit 0
                ;;
            13)
              verificar_stack "pgadmin" && continue || echo ""
                if verificar_docker_e_portainer_traefik; then
                  ferramenta_pgadmin
                fi
                ;;
            14)
              verificar_stack "nocobase" && continue || echo ""
                if verificar_docker_e_portainer_traefik; then
                  ferramenta_nocobase
                fi
                ;;
            15)
              verificar_stack "botpress" && continue || echo ""
                if verificar_docker_e_portainer_traefik; then
                  ferramenta_botpress
                fi
                ;;
            16)
              verificar_stack "baserow" && continue || echo ""
                if verificar_docker_e_portainer_traefik; then
                  ferramenta_baserow
                fi
                ;;
            17)
              verificar_stack "mongodb" && continue || echo ""
                if verificar_docker_e_portainer_traefik; then
                  ferramenta_mongodb
                fi
                ;;
            18)
              verificar_stack "rabbitmq" && continue || echo ""
                if verificar_docker_e_portainer_traefik; then
                  ferramenta_rabbitmq
                fi
                ;;
            19)
              verificar_stack "uptimekuma" && continue || echo ""
                if verificar_docker_e_portainer_traefik; then
                  ferramenta_uptimekuma
                fi
                ;;
            20)
              verificar_stack "calcom" && continue || echo ""
                if verificar_docker_e_portainer_traefik; then
                  ferramenta_calcom
                fi
                ;;
            21)
              verificar_stack "mautic" && continue || echo ""
                if verificar_docker_e_portainer_traefik; then
                  ferramenta_mautic
                fi
                ;;
            22)
              verificar_stack "appsmith" && continue || echo ""
                if verificar_docker_e_portainer_traefik; then
                  ferramenta_appsmith
                fi
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
