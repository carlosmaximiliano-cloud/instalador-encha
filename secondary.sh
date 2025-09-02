
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

msg_qdrant(){
    clear
    echo -e "${roxo}"
centralizar "      ██████╗ ██████╗ ██████╗  █████╗ ███╗   ██╗████████╗"
centralizar "    ██╔═══██╗██╔══██╗██╔══██╗██╔══██╗████╗  ██║╚══██╔══╝"
centralizar "    ██║   ██║██║  ██║██████╔╝███████║██╔██╗ ██║   ██║"
centralizar "    ██║▄▄ ██║██║  ██║██╔══██╗██╔══██║██║╚██╗██║   ██║"
centralizar "    ╚██████╔╝██████╔╝██║  ██║██║  ██║██║ ╚████║   ██║"
centralizar "     ╚══▀▀═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝"
    echo -e "${reset}"
    echo ""
}

msg_woofedcrm(){
    clear
    echo -e "${roxo}"
centralizar "██╗    ██╗ ██████╗  ██████╗ ███████╗███████╗██████╗      ██████╗██████╗ ███╗   ███╗"
centralizar "██║    ██║██╔═══██╗██╔═══██╗██╔════╝██╔════╝██╔══██╗    ██╔════╝██╔══██╗████╗ ████║"
centralizar "██║ █╗ ██║██║   ██║██║   ██║█████╗  █████╗  ██║  ██║    ██║     ██████╔╝██╔████╔██║"
centralizar "██║███╗██║██║   ██║██║   ██║██╔══╝  ██╔══╝  ██║  ██║    ██║     ██╔══██╗██║╚██╔╝██║"
centralizar "╚███╔███╔╝╚██████╔╝╚██████╔╝██║     ███████╗██████╔╝    ╚██████╗██║  ██║██║ ╚═╝ ██║"
centralizar " ╚══╝╚══╝  ╚═════╝  ╚═════╝ ╚═╝     ╚══════╝╚═════╝      ╚═════╝╚═╝  ╚═╝╚═╝     ╚═╝"
    echo -e "${reset}"
    echo ""
}

msg_twentycrm() {
    clear
    echo -e "${roxo}"
centralizar "████████╗██╗    ██╗███████╗███╗   ██╗████████╗██╗   ██╗ ██████╗██████╗ ███╗   ███╗"
centralizar "╚══██╔══╝██║    ██║██╔════╝████╗  ██║╚══██╔══╝╚██╗ ██╔╝██╔════╝██╔══██╗████╗ ████║"
centralizar "   ██║   ██║ █╗ ██║█████╗  ██╔██╗ ██║   ██║    ╚████╔╝ ██║     ██████╔╝██╔████╔██║"
centralizar "   ██║   ██║███╗██║██╔══╝  ██║╚██╗██║   ██║     ╚██╔╝  ██║     ██╔══██╗██║╚██╔╝██║"
centralizar "   ██║   ╚███╔███╔╝███████╗██║ ╚████║   ██║      ██║   ╚██████╗██║  ██║██║ ╚═╝ ██║"
centralizar "   ╚═╝    ╚══╝╚══╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝      ╚═╝    ╚═════╝╚═╝  ╚═╝╚═╝     ╚═╝"
    echo -e "${reset}"
    echo ""
}

msg_mattermost(){
    clear
    echo -e "${roxo}"
centralizar "███╗   ███╗ █████╗ ████████╗████████╗███████╗██████╗ ███╗   ███╗ ██████╗ ███████╗████████╗"
centralizar "████╗ ████║██╔══██╗╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██╔═══██╗██╔════╝╚══██╔══╝"
centralizar "██╔████╔██║███████║   ██║      ██║   █████╗  ██████╔╝██╔████╔██║██║   ██║███████╗   ██║"
centralizar "██║╚██╔╝██║██╔══██║   ██║      ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║   ██║╚════██║   ██║"
centralizar "██║ ╚═╝ ██║██║  ██║   ██║      ██║   ███████╗██║  ██║██║ ╚═╝ ██║╚██████╔╝███████║   ██║"
centralizar "╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝ ╚═════╝ ╚══════╝   ╚═╝"
    echo -e "${reset}"
    echo ""
}

msg_outline(){
    clear
    echo -e "${roxo}"
centralizar "  ██████╗ ██╗   ██╗████████╗██╗     ██╗███╗   ██╗███████╗"
centralizar " ██╔═══██╗██║   ██║╚══██╔══╝██║     ██║████╗  ██║██╔════╝"
centralizar " ██║   ██║██║   ██║   ██║   ██║     ██║██╔██╗ ██║█████╗"
centralizar " ██║   ██║██║   ██║   ██║   ██║     ██║██║╚██╗██║██╔══╝"
centralizar " ╚██████╔╝╚██████╔╝   ██║   ███████╗██║██║ ╚████║███████╗"
centralizar "  ╚═════╝  ╚═════╝    ╚═╝   ╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝"
    echo -e "${reset}"
    echo ""
}

msg_focalboard(){
    clear
    echo -e "${roxo}"
centralizar "███████╗ ██████╗  ██████╗ █████╗ ██╗     ██████╗  ██████╗  █████╗ ██████╗ ██████╗"
centralizar "██╔════╝██╔═══██╗██╔════╝██╔══██╗██║     ██╔══██╗██╔═══██╗██╔══██╗██╔══██╗██╔══██╗"
centralizar "█████╗  ██║   ██║██║     ███████║██║     ██████╔╝██║   ██║███████║██████╔╝██║  ██║"
centralizar "██╔══╝  ██║   ██║██║     ██╔══██║██║     ██╔══██╗██║   ██║██╔══██║██╔══██╗██║  ██║"
centralizar "██║     ╚██████╔╝╚██████╗██║  ██║███████╗██████╔╝╚██████╔╝██║  ██║██║  ██║██████╔╝"
centralizar "╚═╝      ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝"
    echo -e "${reset}"
    echo ""
}

msg_glpi(){
    clear
    echo -e "${roxo}"
centralizar "     ██████╗ ██╗     ██████╗ ██╗"
centralizar "    ██╔════╝ ██║     ██╔══██╗██║"
centralizar "    ██║  ███╗██║     ██████╔╝██║"
centralizar "    ██║   ██║██║     ██╔═══╝ ██║"
centralizar "    ╚██████╔╝███████╗██║     ██║"
centralizar "     ╚═════╝ ╚══════╝╚═╝     ╚═╝"
    echo -e "${reset}"
    echo ""
}

msg_flowise() {
    clear
    echo -e "${roxo}"
    centralizar "███████╗██╗      ██████╗ ██╗    ██╗██╗███████╗███████╗"
    centralizar "██╔════╝██║     ██╔═══██╗██║    ██║██║██╔════╝██╔════╝"
    centralizar "█████╗  ██║     ██║   ██║██║ █╗ ██║██║███████╗█████╗"
    centralizar "██╔══╝  ██║     ██║   ██║██║███╗██║██║╚════██║██╔══╝"
    centralizar "██║     ███████╗╚██████╔╝╚███╔███╔╝██║███████║███████╗"
    centralizar "╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝ ╚═╝╚══════╝╚══════╝"
    echo -e "${reset}"
    echo ""
}

msg_langflow() {
    clear
    echo -e "${roxo}"
    centralizar "██╗      █████╗ ███╗   ██╗ ██████╗ ███████╗██╗      ██████╗ ██╗    ██╗"
    centralizar "██║     ██╔══██╗████╗  ██║██╔════╝ ██╔════╝██║     ██╔═══██╗██║    ██║"
    centralizar "██║     ███████║██╔██╗ ██║██║  ███╗█████╗  ██║     ██║   ██║██║ █╗ ██║"
    centralizar "██║     ██╔══██║██║╚██╗██║██║   ██║██╔══╝  ██║     ██║   ██║██║███╗██║"
    centralizar "███████╗██║  ██║██║ ╚████║╚██████╔╝██║     ███████╗╚██████╔╝╚███╔███╔╝"
    centralizar "╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝"
    echo -e "${reset}"
    echo ""
}

msg_ollama(){
    clear
    echo -e "${roxo}"
    centralizar " ██████╗ ██╗     ██╗      █████╗ ███╗   ███╗ █████╗"
    centralizar "██╔═══██╗██║     ██║     ██╔══██╗████╗ ████║██╔══██╗"
    centralizar "██║   ██║██║     ██║     ███████║██╔████╔██║███████║"
    centralizar "██║   ██║██║     ██║     ██╔══██║██║╚██╔╝██║██╔══██║"
    centralizar "╚██████╔╝███████╗███████╗██║  ██║██║ ╚═╝ ██║██║  ██║"
    centralizar " ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝"
    echo -e "${reset}"
    echo ""
}

msg_anythingllm(){
    clear
    echo -e "${roxo}"
    centralizar " █████╗ ███╗   ██╗██╗   ██╗████████╗██╗  ██╗██╗███╗   ██╗ ██████╗     ██╗     ██╗     ███╗   ███╗"
    centralizar "██╔══██╗████╗  ██║╚██╗ ██╔╝╚══██╔══╝██║  ██║██║████╗  ██║██╔════╝     ██║     ██║     ████╗ ████║"
    centralizar "███████║██╔██╗ ██║ ╚████╔╝    ██║   ███████║██║██╔██╗ ██║██║  ███╗    ██║     ██║     ██╔████╔██║"
    centralizar "██╔══██║██║╚██╗██║  ╚██╔╝     ██║   ██╔══██║██║██║╚██╗██║██║   ██║    ██║     ██║     ██║╚██╔╝██║"
    centralizar "██║  ██║██║ ╚████║   ██║      ██║   ██║  ██║██║██║ ╚████║╚██████╔╝    ███████╗███████╗██║ ╚═╝ ██║"
    centralizar "╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝      ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝     ╚══════╝╚══════╝╚═╝     ╚═╝"
    echo -e "${reset}"
    echo ""
}

msg_nocodb(){
    clear
    echo -e "${roxo}"
    centralizar "███╗   ██╗ ██████╗  ██████╗ ██████╗ ██████╗ ██████╗"
    centralizar "████╗  ██║██╔═══██╗██╔════╝██╔═══██╗██╔══██╗██╔══██╗"
    centralizar "██╔██╗ ██║██║   ██║██║     ██║   ██║██║  ██║██████╔╝"
    centralizar "██║╚██╗██║██║   ██║██║     ██║   ██║██║  ██║██╔══██╗"
    centralizar "██║ ╚████║╚██████╔╝╚██████╗╚██████╔╝██████╔╝██████╔╝"
    centralizar "╚═╝  ╚═══╝ ╚═════╝  ╚═════╝ ╚═════╝ ╚═════╝ ╚═════╝"
    echo -e "${reset}"
    echo ""
}

msg_humhub(){
    clear
    echo -e "${roxo}"
    centralizar "██╗  ██╗██╗   ██╗███╗   ███╗██╗  ██╗██╗   ██╗██████╗"
    centralizar "██║  ██║██║   ██║████╗ ████║██║  ██║██║   ██║██╔══██╗"
    centralizar "███████║██║   ██║██╔████╔██║███████║██║   ██║██████╔╝"
    centralizar "██╔══██║██║   ██║██║╚██╔╝██║██╔══██║██║   ██║██╔══██╗"
    centralizar "██║  ██║╚██████╔╝██║ ╚═╝ ██║██║  ██║╚██████╔╝██████╔╝"
    centralizar "╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝"
    echo -e "${reset}"
    echo ""
}

msg_wordpress() {
    clear
    echo -e "${roxo}"
    centralizar "██╗    ██╗ ██████╗ ██████╗ ██████╗ ██████╗ ██████╗ ███████╗███████╗███████╗"
    centralizar "██║    ██║██╔═══██╗██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝██╔════╝"
    centralizar "██║ █╗ ██║██║   ██║██████╔╝██║  ██║██████╔╝██████╔╝█████╗  ███████╗███████╗"
    centralizar "██║███╗██║██║   ██║██╔══██╗██║  ██║██╔═══╝ ██╔══██╗██╔══╝  ╚════██║╚════██║"
    centralizar "╚███╔███╔╝╚██████╔╝██║  ██║██████╔╝██║     ██║  ██║███████╗███████║███████║"
    centralizar " ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝"
    echo -e "${reset}"
    echo ""
}

msg_formbricks() {
    clear
    echo -e "${roxo}"
    centralizar "███████╗ ██████╗ ██████╗ ███╗   ███╗██████╗ ██████╗ ██╗ ██████╗██╗  ██╗███████╗"
    centralizar "██╔════╝██╔═══██╗██╔══██╗████╗ ████║██╔══██╗██╔══██╗██║██╔════╝██║ ██╔╝██╔════╝"
    centralizar "█████╗  ██║   ██║██████╔╝██╔████╔██║██████╔╝██████╔╝██║██║     █████╔╝ ███████╗"
    centralizar "██╔══╝  ██║   ██║██╔══██╗██║╚██╔╝██║██╔══██╗██╔══██╗██║██║     ██╔═██╗ ╚════██║"
    centralizar "██║     ╚██████╔╝██║  ██║██║ ╚═╝ ██║██████╔╝██║  ██║██║╚██████╗██║  ██╗███████║"
    centralizar "╚═╝      ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝"
    echo -e "${reset}"
    echo ""
}

msg_metabase() {
    clear
    echo -e "${roxo}"
    centralizar "███╗   ███╗███████╗████████╗ █████╗ ██████╗  █████╗ ███████╗███████╗"
    centralizar "████╗ ████║██╔════╝╚══██╔══╝██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝"
    centralizar "██╔████╔██║█████╗     ██║   ███████║██████╔╝███████║███████╗█████╗"
    centralizar "██║╚██╔╝██║██╔══╝     ██║   ██╔══██║██╔══██╗██╔══██║╚════██║██╔══╝"
    centralizar "██║ ╚═╝ ██║███████╗   ██║   ██║  ██║██████╔╝██║  ██║███████║███████╗"
    centralizar "╚═╝     ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝"
    echo -e "${reset}"
    echo ""
}

msg_docuseal(){
    clear
    echo -e "${roxo}"
    centralizar "██████╗  ██████╗  ██████╗██╗   ██╗███████╗███████╗ █████╗ ██╗"
    centralizar "██╔══██╗██╔═══██╗██╔════╝██║   ██║██╔════╝██╔════╝██╔══██╗██║"
    centralizar "██║  ██║██║   ██║██║     ██║   ██║███████╗█████╗  ███████║██║"
    centralizar "██║  ██║██║   ██║██║     ██║   ██║╚════██║██╔══╝  ██╔══██║██║"
    centralizar "██████╔╝╚██████╔╝╚██████╗╚██████╔╝███████║███████╗██║  ██║███████╗"
    centralizar "╚═════╝  ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝"
    echo -e "${reset}"
    echo ""
}

msg_monitor() {
    clear
    echo -e "${roxo}"
    centralizar "██████╗ ██████╗  █████╗ ███████╗ █████╗ ███╗   ██╗ █████╗"
    centralizar "██╔════╝ ██╔══██╗██╔══██╗██╔════╝██╔══██╗████╗  ██║██╔══██╗"
    centralizar "██║  ███╗██████╔╝███████║█████╗  ███████║██╔██╗ ██║███████║"
    centralizar "██║   ██║██╔══██╗██╔══██║██╔══╝  ██╔══██║██║╚██╗██║██╔══██║"
    centralizar "╚██████╔╝██║  ██║██║  ██║██║     ██║  ██║██║ ╚████║██║  ██║"
    centralizar " ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝"
    echo -e "${reset}"
    echo ""
}

msg_dify() {
    clear
    echo -e "${roxo}"
    centralizar "██████╗ ██╗███████╗██╗   ██╗ █████╗ ██╗"
    centralizar "██╔══██╗██║██╔════╝╚██╗ ██╔╝██╔══██╗██║"
    centralizar "██║  ██║██║█████╗   ╚████╔╝ ███████║██║"
    centralizar "██║  ██║██║██╔══╝    ╚██╔╝  ██╔══██║██║"
    centralizar "██████╔╝██║██║        ██║   ██║  ██║██║"
    centralizar "╚═════╝ ╚═╝╚═╝        ╚═╝   ╚═╝  ╚═╝╚═╝"
    echo -e "${reset}"
    echo ""
}

msg_affine(){
    clear
    echo -e "${roxo}"
    centralizar "   █████╗ ███████╗███████╗██╗███╗   ██╗███████╗"
    centralizar "  ██╔══██╗██╔════╝██╔════╝██║████╗  ██║██╔════╝"
    centralizar "  ███████║█████╗  █████╗  ██║██╔██╗ ██║█████╗"
    centralizar "  ██╔══██║██╔══╝  ██╔══╝  ██║██║╚██╗██║██╔══╝"
    centralizar "  ██║  ██║██║     ██║     ██║██║ ╚████║███████╗"
    centralizar "  ╚═╝  ╚═╝╚═╝     ╚═╝     ╚═╝╚═╝  ╚═══╝╚══════╝"
    echo -e "${reset}"
    echo ""
}

msg_vaultwarden() {
    clear
    echo -e "${roxo}"
    centralizar "██╗   ██╗ █████╗ ██╗   ██╗██╗  ████████╗██╗    ██╗ █████╗ ██████╗ ██████╗ ███████╗███╗   ██╗"
    centralizar "██║   ██║██╔══██╗██║   ██║██║  ╚══██╔══╝██║    ██║██╔══██╗██╔══██╗██╔══██╗██╔════╝████╗  ██║"
    centralizar "██║   ██║███████║██║   ██║██║     ██║   ██║ █╗ ██║███████║██████╔╝██║  ██║█████╗  ██╔██╗ ██║"
    centralizar "╚██╗ ██╔╝██╔══██║██║   ██║██║     ██║   ██║███╗██║██╔══██║██╔══██╗██║  ██║██╔══╝  ██║╚██╗██║"
    centralizar " ╚████╔╝ ██║  ██║╚██████╔╝███████╗██║   ╚███╔███╔╝██║  ██║██║  ██║██████╔╝███████╗██║ ╚████║"
    centralizar "  ╚═══╝  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝    ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═══╝"
    echo -e "${reset}"
    echo ""
}

msg_nextcloud() {
    clear
    echo -e "${roxo}"
    centralizar "███╗   ██╗███████╗██╗  ██╗████████╗ ██████╗██╗      ██████╗ ██╗   ██╗██████╗"
    centralizar "████╗  ██║██╔════╝╚██╗██╔╝╚══██╔══╝██╔════╝██║     ██╔═══██╗██║   ██║██╔══██╗"
    centralizar "██╔██╗ ██║█████╗   ╚███╔╝    ██║   ██║     ██║     ██║   ██║██║   ██║██║  ██║"
    centralizar "██║╚██╗██║██╔══╝   ██╔██╗    ██║   ██║     ██║     ██║   ██║██║   ██║██║  ██║"
    centralizar "██║ ╚████║███████╗██╔╝ ██╗   ██║   ╚██████╗███████╗╚██████╔╝╚██████╔╝██████╔╝"
    centralizar "╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝   ╚═╝    ╚═════╝╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝"
    echo -e "${reset}"
    echo ""
}

msg_strapi() {
    clear
    echo -e "${roxo}"
    centralizar "███████╗████████╗██████╗  █████╗ ██████╗ ██╗"
    centralizar "██╔════╝╚══██╔══╝██╔══██╗██╔══██╗██╔══██╗██║"
    centralizar "███████╗   ██║   ██████╔╝███████║██████╔╝██║"
    centralizar "╚════██║   ██║   ██╔══██╗██╔══██║██╔═══╝ ██║"
    centralizar "███████║   ██║   ██║  ██║██║  ██║██║     ██║"
    centralizar "╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝"
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

pegar_senha_postgres_formatada() {
    while [[ ! -f /root/postgres.yaml ]]; do
        echo "Aguardando o arquivo /root/postgres.yaml..."
        sleep 5
    done

    # Extrai a senha e já a formata, removendo delimitadores, aspas, espaços e colchetes.
    senha_postgres=$(grep "POSTGRES_PASSWORD" /root/postgres.yaml | sed 's/.*[=:] *//; s/[][\"'\'']//g; s/^[ \t]*//;s/[ \t]*$//')

    # Validação para garantir que a senha não ficou vazia após a limpeza
    if [ -z "$senha_postgres" ]; then
        echo "ERRO: Não foi possível extrair a senha do postgres de /root/postgres.yaml."
        exit 1
    fi
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
    external: true
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

ferramenta_qdrant(){
  msg_qdrant
  dados

  echo -e "\e[97m🚀 Iniciando a instalação do Qdrant...\e[0m"

  cat > qdrant.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  qdrant:
    image: qdrant/qdrant:latest
    volumes:
      - qdrant_data:/qdrant/storage
    networks:
      - ${nome_rede_interna}
    ports:
      - "6333:6333"
      - "6334:6334"
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 2048M
volumes:
  qdrant_data:
networks:
  ${nome_rede_interna}:
    external: true
EOL

  STACK_NAME="qdrant"
  stack_editavel
  wait_stack qdrant_qdrant

  read -r ip _ <<<"$(hostname -I)"

  cd /root/dados_vps
  cat > dados_qdrant <<EOL
[ QDRANT ]

Host: ${ip}
Porta gRPC: 6334
Porta REST: 6333
Dashboard: http://${ip}:6333/dashboard
EOL

  cd

  msg_resumo_informacoes
  echo "✅ Qdrant instalado com sucesso!"
  echo "Host: ${ip}"
  echo "Porta REST API: 6333"
  echo "Acesse o Dashboard em: http://${ip}:6333/dashboard"
  msg_retorno_menu

}

ferramenta_woofedcrm() {
  msg_woofedcrm
  dados

  while true; do
    echo -e "\n📍 \e[97mPasso ${amarelo}1/3\e[0m"
    echo -en "🔗 \e[33mDigite o domínio para o WoofedCRM (ex: crm.encha.ai): \e[0m" && read -r url_woofed
    echo -e "\n📍 \e[97mPasso ${amarelo}2/3\e[0m"
    echo -en "👤 \e[33mDigite o usuário para o painel MOTOR (admin) (ex: encha_admin): \e[0m" && read -r user_motor_woofed
    echo -e "\n📍 \e[97mPasso ${amarelo}3/3\e[0m"
    echo -en "🔑 \e[33mDigite a senha para o painel MOTOR: \e[0m" && read -s -r pass_motor_woofed
    echo ""

    clear
    msg_woofedcrm
    echo -e "\e[33m🔍 Por favor, revise as informações abaixo:\e[0m\n"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "🌐 \e[33mDomínio WoofedCRM:\e[97m $url_woofed\e[0m"
    echo -e "👤 \e[33mUsuário MOTOR:\e[97m $user_motor_woofed\e[0m"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    read -p $'\n\e[32m✅ As respostas estão corretas?\e[0m \e[33m(Y/N)\e[0m: ' confirmacao
    if [[ "$confirmacao" =~ ^[Yy]$ ]]; then break; else msg_woofedcrm; fi
  done

  echo -e "\e[97m🚀 Iniciando a instalação do Woofed CRM...\e[0m"
  verificar_container_pgvector || ferramenta_pgvector
  pegar_senha_pgvector
  criar_banco_pgvector_da_stack "woofedcrm"

  verificar_container_redis || ferramenta_redis

  encryption_key_woofed=$(openssl rand -hex 16)

  # verifica se o arquivo evolution.yaml existe para preencher as variáveis
  if [ -f "/root/dados_vps/dados_evolution" ]; then
    EVOLUTION_API_ENDPOINT="- EVOLUTION_API_ENDPOINT=$(grep "URL:" /root/dados_vps/dados_evolution | awk '{print $2}')"
    EVOLUTION_API_ENDPOINT_TOKEN="- EVOLUTION_API_ENDPOINT_TOKEN=$(grep "Global API Key:" /root/dados_vps/dados_evolution | awk '{print $4}')"
  else
    EVOLUTION_API_ENDPOINT="#- EVOLUTION_API_ENDPOINT="
    EVOLUTION_API_ENDPOINT_TOKEN="#- EVOLUTION_API_ENDPOINT_TOKEN="
  fi

  cat > woofedcrm.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  woofedcrm_web:
    image: douglara/woofedcrm:latest
    command: bundle exec rails s -p 3000 -b 0.0.0.0
    # CORREÇÃO: Volume de assets removido
    networks:
      - ${nome_rede_interna}
    environment:
      - FRONTEND_URL=https://${url_woofed}
      - SECRET_KEY_BASE=${encryption_key_woofed}
      - ENABLE_USER_SIGNUP=true
      - MOTOR_AUTH_USERNAME=${user_motor_woofed}
      - MOTOR_AUTH_PASSWORD=${pass_motor_woofed}
      ${EVOLUTION_API_ENDPOINT}
      ${EVOLUTION_API_ENDPOINT_TOKEN}
      - DATABASE_URL=postgres://postgres:${senha_pgvector}@pgvector:5432/woofedcrm
      - REDIS_URL=redis://redis:6379/0
      - ACTIVE_STORAGE_SERVICE=local
      - RAILS_ENV=production
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.woofedcrm.rule=Host(\`${url_woofed}\`)"
        - "traefik.http.services.woofedcrm.loadbalancer.server.port=3000"
        - "traefik.http.routers.woofedcrm.entrypoints=websecure"
        - "traefik.http.routers.woofedcrm.tls.certresolver=letsencryptresolver"
  woofedcrm_sidekiq:
    image: douglara/woofedcrm:latest
    command: bundle exec sidekiq -C config/sidekiq.yml
    # CORREÇÃO: Volume de assets removido
    networks:
      - ${nome_rede_interna}
    environment:
      - FRONTEND_URL=https://${url_woofed}
      - SECRET_KEY_BASE=${encryption_key_woofed}
      - DATABASE_URL=postgres://postgres:${senha_pgvector}@pgvector:5432/woofedcrm
      - REDIS_URL=redis://redis:6379/0
      - RAILS_ENV=production
    deploy:
      replicas: 1
# CORREÇÃO: Volume de assets removido da declaração final
networks:
  ${nome_rede_interna}:
    external: true
EOL

  STACK_NAME="woofedcrm"
  stack_editavel
  wait_stack woofedcrm_woofedcrm_web woofedcrm_woofedcrm_sidekiq

  echo "Aguardando o serviço estabilizar para migrar o banco de dados..."
  sleep 20

  CONTAINER_ID=$(docker ps -q --filter "name=woofedcrm_woofedcrm_web" | head -n1)
  if [ -n "$CONTAINER_ID" ]; then
    docker exec -it "$CONTAINER_ID" bundle exec rails db:create > /dev/null 2>&1
    docker exec -it "$CONTAINER_ID" bundle exec rails db:migrate > /dev/null 2>&1
    echo "✅ Migração do banco de dados concluída."
  else
    echo "❌ Não foi possível encontrar o contêiner do WoofedCRM para migrar o banco de dados."
  fi

  cd /root/dados_vps
  cat > dados_woofedcrm <<EOL
[ WOOFED CRM ]

Dominio: https://${url_woofed}
Usuario MOTOR: ${user_motor_woofed}
Senha MOTOR: ${pass_motor_woofed}
Painel MOTOR: https://${url_woofed}/motor_admin
EOL
  cd

  msg_resumo_informacoes
  echo "✅ Woofed CRM instalado com sucesso!"
  echo "Acesse em: https://${url_woofed}"
  echo "Crie seu usuário no primeiro acesso."
  echo "Painel Admin (MOTOR): https://${url_woofed}/motor_admin"
  msg_retorno_menu

}

ferramenta_twentycrm() {
    msg_twentycrm
    dados

    while true; do
        echo -e "\n📍 \e[97mPasso ${amarelo}1/3\e[0m"
        echo -en "🔗 \e[33mDigite o domínio para o TwentyCRM (ex: 20.encha.ai): \e[0m" && read -r url_twentycrm
        echo -e "\n📍 \e[97mPasso ${amarelo}2/3\e[0m"
        echo -en "👤 \e[33mDigite o usuário para o painel MOTOR (admin) (ex: encha_admin): \e[0m" && read -r user_motor_woofed # Esta variável pode ser renomeada para _twentycrm, mas funciona
        echo -e "\n📍 \e[97mPasso ${amarelo}3/3\e[0m"
        echo -en "🔑 \e[33mDigite a senha para o painel MOTOR: \e[0m" && read -s -r pass_motor_woofed # Esta variável pode ser renomeada
        echo ""

        clear
        msg_twentycrm
        echo -e "\e[33m🔍 Por favor, revise as informações abaixo:\e[0m\n"
        echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo -e "🌐 \e[33mDomínio TwentyCRM:\e[97m $url_twentycrm\e[0m"
        echo -e "👤 \e[33mUsuário MOTOR:\e[97m $user_motor_woofed\e[0m"
        echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        read -p $'\n\e[32m✅ As respostas estão corretas?\e[0m \e[33m(Y/N)\e[0m: ' confirmacao
        if [[ "$confirmacao" =~ ^[Yy]$ ]]; then break; else msg_twentycrm; fi
    done

    echo -e "\e[97m🚀 Iniciando a instalação do TwentyCRM...\e[0m"
    
    senha_postgres_twentycrm=$(openssl rand -hex 16)
    Key_aleatoria_twentycrm_1=$(openssl rand -hex 16)

    cat > twentycrm.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  twentycrm_server:
    image: twentycrm/twenty:latest
    volumes:
      - twentycrm_data:/app/packages/twenty-server/.local-storage
      - twentycrm_docker:/app/docker-data
    networks:
      - ${nome_rede_interna}
    environment:
      - PORT=3000
      - SERVER_URL=https://${url_twentycrm}
      - REDIS_URL=redis://redis:6379
      - PG_DATABASE_URL=postgres://postgres:${senha_postgres_twentycrm}@twentycrm_db:5432/default
      - STORAGE_TYPE=local
      - APP_SECRET=${Key_aleatoria_twentycrm_1}
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.twentycrm.rule=Host(\`${url_twentycrm}\`)"
        - "traefik.http.services.twentycrm.loadbalancer.server.port=3000"
        - "traefik.http.routers.twentycrm.entrypoints=websecure"
        - "traefik.http.routers.twentycrm.tls.certresolver=letsencryptresolver"

  twentycrm_worker:
    image: twentycrm/twenty:latest
    command: ["yarn", "worker:prod"]
    networks:
      - ${nome_rede_interna}
    environment:
      - PORT=3000
      - SERVER_URL=https://${url_twentycrm}
      - REDIS_URL=redis://redis:6379
      - PG_DATABASE_URL=postgres://postgres:${senha_postgres_twentycrm}@twentycrm_db:5432/default
      - DISABLE_DB_MIGRATIONS=true
      - STORAGE_TYPE=local
      - APP_SECRET=${Key_aleatoria_twentycrm_1}

  twentycrm_db:
    image: twentycrm/twenty-postgres-spilo:latest
    volumes:
      - twentycrm_db_data:/home/postgres/pgdata
    networks:
      - ${nome_rede_interna}
    environment:
      - PGUSER_SUPERUSER=postgres
      - POSTGRESQL_PASSWORD=${senha_postgres_twentycrm}
      - PGPASSWORD_SUPERUSER=${senha_postgres_twentycrm}
      - ALLOW_NOSSL=true
      - SPILO_PROVIDER=local

volumes:
  twentycrm_data:
  twentycrm_docker:
  twentycrm_db_data:

networks:
  ${nome_rede_interna}:
    external: true
EOL

    STACK_NAME="twentycrm"
    stack_editavel
    wait_stack twentycrm_twentycrm_server twentycrm_twentycrm_worker twentycrm_twentycrm_db

    cd /root/dados_vps
    cat > dados_twentycrm <<EOL
[ TWENTYCRM ]

Dominio: https://${url_twentycrm}
Usuario: (criado no primeiro acesso)
Senha: (criada no primeiro acesso)
EOL
    cd

    msg_resumo_informacoes
    echo "✅ TwentyCRM instalado com sucesso!"
    echo "Acesse em: https://${url_twentycrm}"
    echo "Crie seu usuário no primeiro acesso."
    msg_retorno_menu
}

ferramenta_mattermost() {
    msg_mattermost
    dados

    read -p $'\e[33mDigite o domínio para o Mattermost (ex: chat.encha.ai): \e[0m' url_mattermost
    
    echo -e "\e[97m🚀 Iniciando a instalação do Mattermost...\e[0m"
    verificar_container_postgres || ferramenta_postgres
    pegar_senha_postgres
    criar_banco_postgres_da_stack "mattermost"

    cat > mattermost.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  mattermost:
    image: mattermost/mattermost-team-edition:latest
    volumes:
      - mattermost_data:/mattermost/data
      - mattermost_config:/mattermost/config
      - mattermost_logs:/mattermost/logs
      - mattermost_plugins:/mattermost/plugins
      - mattermost_client_plugins:/mattermost/client/plugins
    networks:
      - ${nome_rede_interna}
    environment:
      - MM_SERVICESETTINGS_SITEURL=https://${url_mattermost}
      - MM_SQLSETTINGS_DRIVERNAME=postgres
      - MM_SQLSETTINGS_DATASOURCE=postgres://postgres:${senha_postgres}@postgres:5432/mattermost?sslmode=disable&connect_timeout=10
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.mattermost.rule=Host(\`${url_mattermost}\`)"
        - "traefik.http.services.mattermost.loadbalancer.server.port=8065"
        - "traefik.http.routers.mattermost.entrypoints=websecure"
        - "traefik.http.routers.mattermost.tls.certresolver=letsencryptresolver"

volumes:
  mattermost_data:
    external: true
  mattermost_config:
    external: true
  mattermost_logs:
    external: true
  mattermost_plugins:
    external: true
  mattermost_client_plugins:
    external: true

networks:
  ${nome_rede_interna}:
    external: true
EOL

    STACK_NAME="mattermost"
    stack_editavel
    wait_stack mattermost_mattermost

    cd /root/dados_vps
    cat > dados_mattermost <<EOL
[ MATTERMOST ]

Dominio: https://${url_mattermost}
Usuario: (criado no primeiro acesso)
Senha: (criada no primeiro acesso)
EOL
    cd

    msg_resumo_informacoes
    echo "✅ Mattermost instalado com sucesso!"
    echo "Acesse em: https://${url_mattermost}"
    echo "Crie seu usuário no primeiro acesso."
    msg_retorno_menu
}

ferramenta_outline(){
  msg_outline
  dados

  while true; do
    echo -e "\n\e[33mO Outline requer integração com um provedor de login (Google, Slack, etc).\e[0m"
    echo -e "\e[33mVamos configurar com o Google.\e[0m"
    echo -e "\n📍 \e[97mPasso ${amarelo}1/3\e[0m"
    echo -en "🔗 \e[33mDigite o domínio para o Outline (ex: wiki.encha.ai): \e[0m" && read -r url_outline
    echo -e "\n📍 \e[97mPasso ${amarelo}2/3\e[0m"
    echo -e "🔑 \e[33mCrie as credenciais em: https://console.cloud.google.com/apis/credentials\e[0m"
    echo -en "🆔 \e[33mDigite seu ID de Cliente do Google: \e[0m" && read -r id_google_outline
    echo -e "\n📍 \e[97mPasso ${amarelo}3/3\e[0m"
    echo -en "🔒 \e[33mDigite sua Chave Secreta de Cliente do Google: \e[0m" && read -s -r key_google_outline
    echo ""

    clear
    msg_outline
    echo -e "\e[33m🔍 Por favor, revise as informações abaixo:\e[0m\n"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "🌐 \e[33mDomínio:\e[97m $url_outline\e[0m"
    echo -e "🆔 \e[33mID Cliente Google:\e[97m $id_google_outline\e[0m"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    read -p $'\n\e[32m✅ As respostas estão corretas?\e[0m \e[33m(Y/N)\e[0m: ' confirmacao
    if [[ "$confirmacao" =~ ^[Yy]$ ]]; then break; else msg_outline; fi
  done

  echo -e "\e[97m🚀 Iniciando a instalação do Outline...\e[0m"   
  verificar_container_postgres || ferramenta_postgres
  pegar_senha_postgres
  criar_banco_postgres_da_stack "outline"
  verificar_container_redis || ferramenta_redis

  key1=$(openssl rand -hex 32)
  key2=$(openssl rand -hex 32)

  cat > outline.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  outline:
    image: outlinewiki/outline:latest
    networks:
      - ${nome_rede_interna}
    volumes:
      - outline_uploads:/var/lib/outline/uploads
    environment:
      - URL=https://${url_outline}
      - PORT=3000
      - SECRET_KEY=${key1}
      - UTILS_SECRET=${key2}
      - DATABASE_URL=postgresql://postgres:${senha_postgres}@postgres:5432/outline
      - REDIS_URL=redis://redis_redis:6379
      - PGSSLMODE=disable
      - OIDC_CLIENT_ID=${id_google_outline}
      - OIDC_CLIENT_SECRET=${key_google_outline}
      - OIDC_AUTH_URI=https://accounts.google.com/o/oauth2/auth
      - OIDC_TOKEN_URI=https://accounts.google.com/o/oauth2/token
      - OIDC_USERINFO_URI=https://www.googleapis.com/oauth2/v3/userinfo
      - OIDC_DISPLAY_NAME=Google
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.outline.rule=Host(\`${url_outline}\`)"
        - "traefik.http.services.outline.loadbalancer.server.port=3000"
        - "traefik.http.routers.outline.entrypoints=websecure"
        - "traefik.http.routers.outline.tls.certresolver=letsencryptresolver"
volumes:
  outline_uploads:
networks:
  ${nome_rede_interna}:
    external: true
EOL

  STACK_NAME="outline"
  stack_editavel
  wait_stack outline_outline

  cd /root/dados_vps
  cat > dados_outline <<EOL
[ OUTLINE ]

Dominio: https://${url_outline}
Login: via Google (você precisará autorizar a URL de callback nas suas credenciais do Google)
URL de Callback: https://${url_outline}/auth/oidc.callback
EOL

  cd
  msg_resumo_informacoes
  echo "✅ Outline instalado com sucesso!"
  echo "Acesse em: https://${url_outline}"
  echo -e "⚠️  \e[33mIMPORTANTE: Adicione a seguinte URL de Callback nas suas credenciais do Google:\e[0m"
  echo -e "➡️  \e[97mhttps://${url_outline}/auth/oidc.callback\e[0m"
  msg_retorno_menu

}

ferramenta_focalboard() {
  msg_focalboard
  dados

  read -p $'\e[33mDigite o domínio para o Focalboard (ex: boards.encha.ai): \e[0m' url_focalboard

  echo -e "\e[97m🚀 Iniciando a instalação do Focalboard...\e[0m"

  cat > focalboard.yaml <<EOL
version: "3.8"
services:
  focalboard:
    image: mattermost/focalboard:latest
    volumes:
      - focalboard_data:/opt/focalboard/data
    networks:
      - ${nome_rede_interna}
    environment:
      - VIRTUAL_HOST=${url_focalboard}
      - VIRTUAL_PORT=8000
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.focalboard.rule=Host(\`${url_focalboard}\`)"
        - "traefik.http.services.focalboard.loadbalancer.server.port=8000"
        - "traefik.http.routers.focalboard.entrypoints=websecure"
        - "traefik.http.routers.focalboard.tls.certresolver=letsencryptresolver"
volumes:
  focalboard_data:
networks:
  ${nome_rede_interna}:
    external: true
EOL

  STACK_NAME="focalboard"
  stack_editavel
  wait_stack focalboard_focalboard

  cd /root/dados_vps
  cat > dados_focalboard <<EOL
[ FOCALBOARD ]

Dominio: https://${url_focalboard}
Usuario: (criado no primeiro acesso)
Senha: (criada no primeiro acesso)
EOL

  cd

  msg_resumo_informacoes
  echo "✅ Focalboard instalado com sucesso!"
  echo "Acesse em: https://${url_focalboard}"
  echo "Crie seu usuário no primeiro acesso."
  msg_retorno_menu

}

ferramenta_glpi(){
  msg_glpi
  dados

  read -p $'\e[33mDigite o domínio para o GLPI (ex: helpdesk.encha.ai): \e[0m' url_glpi

  echo -e "\e[97m🚀 Iniciando a instalação do GLPI...\e[0m"
  verificar_container_mysql || ferramenta_mysql
  pegar_senha_mysql_da_stack
  criar_banco_mysql_da_stack "glpi"

  cat > glpi.yaml <<EOL
version: "3.7"
services:
  glpi:
    image: diouxx/glpi:latest
    volumes:
      - glpi_data:/var/www/html/glpi
    networks:
      - ${nome_rede_interna}
    environment:
      - TIMEZONE=America/Sao_Paulo
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.glpi.rule=Host(\`${url_glpi}\`)"
        - "traefik.http.services.glpi.loadbalancer.server.port=80"
        - "traefik.http.routers.glpi.entrypoints=websecure"
        - "traefik.http.routers.glpi.tls.certresolver=letsencryptresolver"
volumes:
  glpi_data:
networks:
  ${nome_rede_interna}:
    external: true
EOL

  STACK_NAME="glpi"
  stack_editavel
  wait_stack glpi_glpi

  cd /root/dados_vps
  cat > dados_glpi <<EOL
[ GLPI ]

Dominio: https://${url_glpi}
---
Credenciais do Banco de Dados para o Setup:
Host: mysql
Usuario: root
Senha: ${senha_mysql}
Banco de dados: glpi
---
Credenciais de Acesso Padrão (após setup):
Usuario: glpi
Senha: glpi
EOL

  cd
  msg_resumo_informacoes
  echo "✅ GLPI instalado!"
  echo "Acesse https://${url_glpi} para completar a instalação."
  echo ""
  echo -e "\e[33mUse as seguintes informações na tela de setup do banco de dados:\e[0m"
  echo "Endereço do servidor SQL: mysql"
  echo "Usuário SQL: root"
  echo "Senha SQL: ${senha_mysql}"
  echo "Banco de dados: glpi"
  msg_retorno_menu

}

ferramenta_flowise() {
  msg_flowise
  dados

  while true; do
    echo -e "\n📍 \e[97mPasso ${amarelo}1/3\e[0m"
    echo -en "🔗 \e[33mDigite o domínio para o Flowise (ex: flowise.encha.ai): \e[0m" && read -r url_flowise
        
    echo -e "\n📍 \e[97mPasso ${amarelo}2/3\e[0m"
    echo -en "👤 \e[33mDigite um usuário para o Flowise (ex: admin): \e[0m" && read -r user_flowise
        
    echo -e "\n📍 \e[97mPasso ${amarelo}3/3\e[0m"
    echo -en "🔑 \e[33mDigite uma senha para o usuário: \e[0m" && read -s -r pass_flowise
    echo ""

    clear
    msg_flowise
    echo -e "\e[33m🔍 Por favor, revise as informações abaixo:\e[0m\n"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "🌐 \e[33mDomínio Flowise:\e[97m $url_flowise\e[0m"
    echo -e "👤 \e[33mUsuário:\e[97m $user_flowise\e[0m"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    read -p $'\n\e[32m✅ As respostas estão corretas?\e[0m \e[33m(Y/N)\e[0m: ' confirmacao
    if [[ "$confirmacao" =~ ^[Yy]$ ]]; then break; msg_flowise; fi
  done

  clear
  echo -e "\e[97m🚀 Iniciando a instalação do Flowise...\e[0m"
  verificar_container_postgres || ferramenta_postgres
  pegar_senha_postgres
  criar_banco_postgres_da_stack "flowise"

  echo -e "\e[97m⚙️ Instalando o Flowise...\e[0m"
  encryption_key=$(openssl rand -hex 16)

  cat > flowise.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  flowise:
    image: flowiseai/flowise:latest
    volumes:
      - flowise_data:/root/.flowise
    networks:
      - $nome_rede_interna
    environment:
      - FLOWISE_USERNAME=$user_flowise
      - FLOWISE_PASSWORD=$pass_flowise
      - DATABASE_TYPE=postgres
      - DATABASE_HOST=postgres
      - DATABASE_PORT=5432
      - DATABASE_USER=postgres
      - DATABASE_PASSWORD=$senha_postgres
      - DATABASE_NAME=flowise
      - FLOWISE_SECRETKEY_OVERWRITE=$encryption_key
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.flowise.rule=Host(\`$url_flowise\`)"
        - "traefik.http.services.flowise.loadbalancer.server.port=3000"
        - "traefik.http.routers.flowise.service=flowise"
        - "traefik.http.routers.flowise.entrypoints=websecure"
        - "traefik.http.routers.flowise.tls.certresolver=letsencryptresolver"
volumes:
  flowise_data:
networks:
  $nome_rede_interna:
    external: true
EOL

  STACK_NAME="flowise"
  stack_editavel
  wait_stack flowise_flowise

  cd /root/dados_vps
  cat > dados_flowise <<EOL
[ FLOWISE ]
Dominio: https://$url_flowise
Usuario: $user_flowise
Senha: $pass_flowise
EOL

  cd

  msg_resumo_informacoes
  echo -e "\e[32m[ FLOWISE ]\e[0m\n"
  echo -e "\e[33m🌐 Domínio:\e[97m https://$url_flowise\e[0m"
  echo -e "\e[33m👤 Usuário:\e[97m $user_flowise\e[0m"
  echo -e "\e[33m🔑 Senha:\e[97m $pass_flowise\e[0m\n"
  msg_retorno_menu

}

ferramenta_langflow(){
  msg_langflow
  dados

  while true; do
    echo -e "\n📍 \e[97mPasso ${amarelo}1/3\e[0m"
    echo -en "🔗 \e[33mDigite o domínio para o LangFlow (ex: langflow.encha.ai): \e[0m" && read -r url_langflow
        
    echo -e "\n📍 \e[97mPasso ${amarelo}2/3\e[0m"
    echo -en "👤 \e[33mDigite um usuário para o LangFlow (ex: admin): \e[0m" && read -r user_langflow
        
    echo -e "\n📍 \e[97mPasso ${amarelo}3/3\e[0m"
    echo -en "🔑 \e[33mDigite uma senha para o usuário: \e[0m" && read -s -r pass_langflow
    echo ""

    clear
    msg_langflow
    echo -e "\e[33m🔍 Por favor, revise as informações abaixo:\e[0m\n"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "🌐 \e[33mDomínio LangFlow:\e[97m $url_langflow\e[0m"
    echo -e "👤 \e[33mUsuário:\e[97m $user_langflow\e[0m"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    read -p $'\n\e[32m✅ As respostas estão corretas?\e[0m \e[33m(Y/N)\e[0m: ' confirmacao
    if [[ "$confirmacao" =~ ^[Yy]$ ]]; then break; else msg_langflow; fi
  done

  clear
  echo -e "\e[97m🚀 Iniciando a instalação do LangFlow...\e[0m"
  verificar_container_postgres || ferramenta_postgres
  pegar_senha_postgres
  criar_banco_postgres_da_stack "langflow"

  echo -e "\e[97m⚙️ Instalando o LangFlow...\e[0m"
  key_langflow=$(python3 -c 'from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())')

  cat > langflow.yaml <<EOL
version: "3.8"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  langflow:
    image: langflowai/langflow:latest
    volumes:
      - langflow_data:/app/langflow
    networks:
      - $nome_rede_interna
    environment:
      - LANGFLOW_AUTO_LOGIN=false
      - LANGFLOW_SUPERUSER=$user_langflow
      - LANGFLOW_SUPERUSER_PASSWORD=$pass_langflow
      - LANGFLOW_HOST=0.0.0.0
      - BACKEND_URL=https://$url_langflow
      - LANGFLOW_SECRET_KEY=$key_langflow
      - LANGFLOW_NEW_USER_IS_ACTIVE=false
      - LANGFLOW_DATABASE_URL=postgresql://postgres:$senha_postgres@postgres:5432/langflow
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.langflow.rule=Host(\`$url_langflow\`)"
        - "traefik.http.services.langflow.loadbalancer.server.port=7860"
        - "traefik.http.routers.langflow.service=langflow"
        - "traefik.http.routers.langflow.entrypoints=websecure"
        - "traefik.http.routers.langflow.tls.certresolver=letsencryptresolver"
volumes:
  langflow_data:
networks:
  $nome_rede_interna:
    external: true
EOL

  STACK_NAME="langflow"
  stack_editavel
  wait_stack langflow_langflow

  cd /root/dados_vps
  cat > dados_langflow <<EOL
[ LANGFLOW ]
Dominio: https://$url_langflow
Usuario: $user_langflow
Senha: $pass_langflow
EOL

  cd

  msg_resumo_informacoes
  echo -e "\e[32m[ LANGFLOW ]\e[0m\n"
  echo -e "\e[33m🌐 Domínio:\e[97m https://$url_langflow\e[0m"
  echo -e "\e[33m👤 Usuário:\e[97m $user_langflow\e[0m"
  echo -e "\e[33m🔑 Senha:\e[97m $pass_langflow\e[0m\n"
  msg_retorno_menu

}

ferramenta_ollama(){
  msg_ollama
  dados

  while true; do
    echo -e "\n📍 \e[97mPasso ${amarelo}1/2\e[0m"
    echo -en "🔗 \e[33mDigite o domínio para a WebUI do Ollama (ex: ollama.encha.ai): \e[0m" && read -r url_ollama
    echo ""
    echo -e "\n📍 \e[97mPasso ${amarelo}2/2\e[0m"
    echo -en "🔗 \e[33mDigite o domínio para a API do Ollama (ex: api-ollama.encha.ai): \e[0m" && read -r url_apiollama
    echo ""
  
    clear
    msg_ollama
    echo -e "\e[33m🔍 Por favor, revise as informações abaixo:\e[0m\n"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "🌐 \e[33mDomínio WebUI:\e[97m $url_ollama\e[0m"
    echo -e "🔗 \e[33mDomínio API:\e[97m $url_apiollama\e[0m"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    read -p $'\n\e[32m✅ As respostas estão corretas?\e[0m \e[33m(Y/N)\e[0m: ' confirmacao
    if [[ "$confirmacao" =~ ^[Yy]$ ]]; then break; else msg_ollama; fi
  done

  clear
  echo -e "\e[97m🚀 Iniciando a instalação do Ollama & OpenWebUI...\e[0m"

  WEBUI_SECRET_KEY=$(openssl rand -hex 16)
  cat > ollama.yaml << EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  ollama:
    image: ollama/ollama:latest
    volumes:
      - ollama_data:/root/.ollama
    networks:
      - $nome_rede_interna
    environment:
      - OLLAMA_HOST=0.0.0.0
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.ollama.rule=Host(\`$url_apiollama\`)"
        - "traefik.http.services.ollama.loadbalancer.server.port=11434"
        - "traefik.http.routers.ollama.service=ollama"
        - "traefik.http.routers.ollama.entrypoints=websecure"
        - "traefik.http.routers.ollama.tls.certresolver=letsencryptresolver"
  openwebui:
    image: ghcr.io/open-webui/open-webui:main
    volumes:
      - openwebui_data:/app/backend/data
    networks:
      - $nome_rede_interna
    environment:
      - OLLAMA_BASE_URL=https://$url_apiollama
      - WEBUI_SECRET_KEY=$WEBUI_SECRET_KEY
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.openwebui.rule=Host(\`$url_ollama\`)"
        - "traefik.http.services.openwebui.loadbalancer.server.port=8080"
        - "traefik.http.routers.openwebui.service=openwebui"
        - "traefik.http.routers.openwebui.entrypoints=websecure"
        - "traefik.http.routers.openwebui.tls.certresolver=letsencryptresolver"
volumes:
  ollama_data:
  openwebui_data:
networks:
  $nome_rede_interna:
    external: true
EOL

  STACK_NAME="ollama"
  stack_editavel
  wait_stack "ollama_openwebui" "ollama_ollama"

  cd /root/dados_vps
  cat > dados_ollama <<EOL
[ OLLAMA ]
WebUI: https://$url_ollama
API: https://$url_apiollama
EOL

  cd
  msg_resumo_informacoes
  echo -e "\e[32m[ OLLAMA & OPENWEBUI ]\e[0m\n"
  echo -e "\e[33m🌐 WebUI:\e[97m https://$url_ollama\e[0m"
  echo -e "\e[33m🔗 API:\e[97m https://$url_apiollama\e[0m"
  msg_retorno_menu

}

ferramenta_anythingllm() {
  msg_anythingllm
  dados

  while true; do
    read -r ip _ <<<"$(hostname -I)"
    echo -e "\n📍 \e[97mPasso ${amarelo}1/3\e[0m"
    echo -en "🔗 \e[33mDigite o domínio para o AnythingLLM (ex: anything.encha.ai): \e[0m" && read -r url_anythingllm
    echo ""
    echo -e "\n📍 \e[97mPasso ${amarelo}2/3\e[0m"
    echo -en "🔗 \e[33mDigite o endpoint do Qdrant (ex: http://$ip:6333): \e[0m" && read -r qdrant_anythingllm
    echo ""
    echo -e "\n📍 \e[97mPasso ${amarelo}3/3\e[0m"
    echo -en "🔑 \e[33mDigite a API Key do Qdrant (se houver): \e[0m" && read -r api_qdrant_anythingllm
    echo ""

    clear
    msg_anythingllm
    echo -e "\e[33m🔍 Por favor, revise as informações abaixo:\e[0m\n"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "🌐 \e[33mDomínio AnythingLLM:\e[97m $url_anythingllm\e[0m"
    echo -e "🔗 \e[33mEndpoint Qdrant:\e[97m $qdrant_anythingllm\e[0m"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    read -p $'\n\e[32m✅ As respostas estão corretas?\e[0m \e[33m(Y/N)\e[0m: ' confirmacao
    if [[ "$confirmacao" =~ ^[Yy]$ ]]; then break; else msg_anythingllm; fi
  done

  clear
  echo -e "\e[97m🚀 Iniciando a instalação do AnythingLLM...\e[0m"
  verificar_docker_e_portainer_traefik || return
  verificar_stack "qdrant" || ferramenta_qdrant

  cat > anythingllm.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  anythingllm:
    image: mintplexlabs/anythingllm:latest
    volumes:
      - anythingllm_storage:/app/server/storage
    networks:
      - $nome_rede_interna
    environment:
      - STORAGE_DIR=/app/server/storage
      - VECTOR_DB=qdrant
      - QDRANT_ENDPOINT=$qdrant_anythingllm
      - QDRANT_API_KEY=$api_qdrant_anythingllm
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.anythingllm.rule=Host(\`$url_anythingllm\`)"
        - "traefik.http.services.anythingllm.loadbalancer.server.port=3001"
        - "traefik.http.routers.anythingllm.service=anythingllm"
        - "traefik.http.routers.anythingllm.entrypoints=websecure"
        - "traefik.http.routers.anythingllm.tls.certresolver=letsencryptresolver"
volumes:
  anythingllm_storage:
networks:
  $nome_rede_interna:
    external: true
EOL

  STACK_NAME="anythingllm"
  stack_editavel
  wait_stack anythingllm_anythingllm

  cd /root/dados_vps
  cat > dados_anythingllm <<EOL
[ ANYTHINGLLM ]
Dominio: https://$url_anythingllm
Usuario: (criado no primeiro acesso)
Senha: (criada no primeiro acesso)
EOL

  cd
  msg_resumo_informacoes
  echo -e "\e[32m[ ANYTHINGLLM ]\e[0m\n"
  echo -e "\e[33m🌐 Domínio:\e[97m https://$url_anythingllm\e[0m"
  msg_retorno_menu

}

ferramenta_nocodb() {
  msg_nocodb
  dados

  while true; do
    echo -e "\n📍 \e[97mPasso ${amarelo}1/1\e[0m"
    echo -en "🔗 \e[33mDigite o domínio para o NocoDB (ex: nocodb.encha.ai): \e[0m" && read -r url_nocodb
    echo ""

    clear
    msg_nocodb
    echo -e "\e[33m🔍 Por favor, revise as informações abaixo:\e[0m\n"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "🌐 \e[33mDomínio NocoDB:\e[97m $url_nocodb\e[0m"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    read -p $'\n\e[32m✅ As respostas estão corretas?\e[0m \e[33m(Y/N)\e[0m: ' confirmacao
    if [[ "$confirmacao" =~ ^[Yy]$ ]]; then break; else msg_nocodb; fi
  done

  clear
  echo -e "\e[97m🚀 Iniciando a instalação do NocoDB...\e[0m"
  verificar_container_postgres || ferramenta_postgres
  pegar_senha_postgres
  criar_banco_postgres_da_stack "nocodb"

  cat > nocodb.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  nocodb: 
    image: nocodb/nocodb:latest
    volumes: 
      - nocodb_data:/usr/app/data
    networks:
      - $nome_rede_interna
    environment: 
      - NC_PUBLIC_URL=https://$url_nocodb
      - NC_DB_TYPE=pg
      - NC_DB_HOST=postgres
      - NC_DB_PORT=5432
      - NC_DB_DATABASE=nocodb
      - NC_DB_USER=postgres
      - NC_DB_PASSWORD=$senha_postgres
      - NC_DISABLE_TELE=true
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.nocodb.rule=Host(\`$url_nocodb\`)"
        - "traefik.http.services.nocodb.loadbalancer.server.port=8080"
        - "traefik.http.routers.nocodb.service=nocodb"
        - "traefik.http.routers.nocodb.entrypoints=websecure"
        - "traefik.http.routers.nocodb.tls.certresolver=letsencryptresolver"
volumes:
  nocodb_data:
networks:
  $nome_rede_interna:
    external: true
EOL

  STACK_NAME="nocodb"
  stack_editavel
  wait_stack "nocodb_nocodb"

  cd /root/dados_vps
  cat > dados_nocodb <<EOL
[ NOCODB ]
Dominio: https://$url_nocodb
Usuario: (criado no primeiro acesso)
Senha: (criada no primeiro acesso)
EOL

  cd
  msg_resumo_informacoes
  echo -e "\e[32m[ NOCODB ]\e[0m\n"
  echo -e "\e[33m🌐 Domínio:\e[97m https://$url_nocodb\e[0m"
  msg_retorno_menu

}

ferramenta_humhub() {
    msg_humhub
    dados

    while true; do
        echo -e "\n📍 \e[97mPasso ${amarelo}1/1\e[0m"
        echo -en "🔗 \e[33mDigite o domínio para o HumHub (ex: social.encha.ai): \e[0m" && read -r url_humhub
        echo ""

        clear
        msg_humhub
        echo -e "\e[33m🔍 Por favor, revise as informações abaixo:\e[0m\n"
        echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo -e "🌐 \e[33mDomínio HumHub:\e[97m $url_humhub\e[0m"
        echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        read -p $'\n\e[32m✅ As respostas estão corretas?\e[0m \e[33m(Y/N)\e[0m: ' confirmacao
        if [[ "$confirmacao" =~ ^[Yy]$ ]]; then break; else msg_humhub; fi
    done

    clear
    echo -e "\e[97m🚀 Iniciando a instalação do HumHub...\e[0m"
    verificar_container_mysql || ferramenta_mysql 
    pegar_senha_mysql_da_stack
    criar_banco_mysql_da_stack "humhub"
    
    cat > humhub.yaml <<EOL
version: '3.7'
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  humhub:
    image: mriedmann/humhub:latest
    volumes:
      - humhub_uploads:/var/www/localhost/htdocs/uploads
    networks:
      - $nome_rede_interna
    environment:
      - HUMHUB_DB_HOST=mysql
      - HUMHUB_DB_USER=root
      - HUMHUB_DB_PASSWORD=$senha_mysql
      - HUMHUB_DB_NAME=humhub
      - HUMHUB_AUTO_INSTALL=false
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints: [node.role == manager]
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.humhub.rule=Host(\`$url_humhub\`)"
        - "traefik.http.services.humhub.loadbalancer.server.port=80"
        - "traefik.http.routers.humhub.service=humhub"
        - "traefik.http.routers.humhub.entrypoints=websecure"
        - "traefik.http.routers.humhub.tls.certresolver=letsencryptresolver"
volumes:
  humhub_uploads:
networks:
  $nome_rede_interna:
    external: true
EOL
    
    STACK_NAME="humhub"
    stack_editavel
    wait_stack "humhub_humhub"
    telemetria HumHub finalizado

    cd /root/dados_vps
    cat > dados_humhub <<EOL
[ HUMHUB ]
Dominio: https://$url_humhub
Usuario: (criado na tela de setup)
Senha: (criada na tela de setup)
EOL
    cd
    
    msg_resumo_informacoes
    echo -e "\e[32m[ HUMHUB ]\e[0m\n"
    echo -e "\e[33m🌐 Domínio:\e[97m https://$url_humhub\e[0m"
    echo -e "\e[33m⚠️  Acesse o domínio para completar a instalação e criar seu usuário admin.\e[0m"
    msg_retorno_menu
}

ferramenta_wordpress() {
    msg_wordpress
    dados

    while true; do
        echo -e "\n📍 Passo 1/2"
        echo -en "🔗 \e[33mDigite o domínio para o Wordpress (ex: loja.encha.ai): \e[0m" && read -r url_wordpress
        echo ""

        echo -e "\n📍 Passo 2/2"
        echo -e "\e[33m--> Use apenas letras minúsculas, sem espaços ou caracteres especiais.\e[0m"
        echo -en "🔗 \e[33mDigite o nome do Site para os arquivos (ex: lojaencha): \e[0m" && read -r nome_site_wordpress
        echo ""

        clear
        msg_wordpress
        echo -e "\e[33m🔍 Por favor, revise as informações abaixo:\e[0m\n"
        echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo -e "🌐 \e[33mDomínio do Wordpress:\e[97m $url_wordpress\e[0m"
        echo -e "📁 \e[33mNome do Site:\e[97m $nome_site_wordpress\e[0m"
        echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        read -p $'\n\e[32m✅ As respostas estão corretas?\e[0m \e[33m(Y/N)\e[0m: ' confirmacao
        if [[ "$confirmacao" =~ ^[Yy]$ ]]; then break; else msg_wordpress; fi
    done

    clear
    echo -e "\e[97m🚀 Iniciando a instalação do Wordpress...\e[0m"
    verificar_container_mysql || ferramenta_mysql
    pegar_senha_mysql_da_stack
    criar_banco_mysql_da_stack "$nome_site_wordpress"
    verificar_container_redis || ferramenta_redis

    cat > wordpress_${nome_site_wordpress}.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  wordpress_${nome_site_wordpress}:
    image: wordpress:latest
    volumes:
      - wordpress_${nome_site_wordpress}:/var/www/html
      - wordpress_${nome_site_wordpress}_php:/usr/local/etc/php
    networks:
      - $nome_rede_interna
    environment:
      - WORDPRESS_DB_NAME=${nome_site_wordpress}
      - WORDPRESS_DB_HOST=mysql
      - WORDPRESS_DB_PORT=3306
      - WORDPRESS_DB_USER=root
      - WORDPRESS_DB_PASSWORD=${senha_mysql}
      - WP_REDIS_HOST=redis
      - WP_REDIS_PORT=6379
      - WP_REDIS_DATABASE=6
      - VIRTUAL_HOST=${url_wordpress}
      - WP_LOCALE=pt_BR
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.wordpress_${nome_site_wordpress}.rule=Host(\`${url_wordpress}\`)"
        - "traefik.http.routers.wordpress_${nome_site_wordpress}.entrypoints=websecure"
        - "traefik.http.routers.wordpress_${nome_site_wordpress}.tls.certresolver=letsencryptresolver"
        - "traefik.http.routers.wordpress_${nome_site_wordpress}.service=wordpress_${nome_site_wordpress}"
        - "traefik.http.services.wordpress_${nome_site_wordpress}.loadbalancer.server.port=80"
        - "traefik.http.services.wordpress_${nome_site_wordpress}.loadbalancer.passHostHeader=true"
volumes:
  wordpress_${nome_site_wordpress}:
    name: wordpress_${nome_site_wordpress}
    external: true
  wordpress_${nome_site_wordpress}_php:
    name: wordpress_${nome_site_wordpress}_php
    external: true
networks:
  ${nome_rede_interna}:
    external: true
EOL

    STACK_NAME="wordpress_${nome_site_wordpress}"
    stack_editavel
    wait_stack "wordpress_${nome_site_wordpress}_wordpress_${nome_site_wordpress}"

    echo "Aguardando para configurar o php.ini..."
    sleep 20
    
    cp /var/lib/docker/volumes/wordpress_${nome_site_wordpress}_php/_data/php.ini-production /var/lib/docker/volumes/wordpress_${nome_site_wordpress}_php/_data/php.ini
    caminho_php_ini="/var/lib/docker/volumes/wordpress_${nome_site_wordpress}_php/_data/php.ini"
    sed -i "s/^upload_max_filesize =.*/upload_max_filesize = 1024M/" "$caminho_php_ini"
    sed -i "s/^max_execution_time =.*/max_execution_time = 450/" "$caminho_php_ini"
    sed -i "s/^memory_limit =.*/memory_limit = 1024M/" "$caminho_php_ini"
    
    echo "Aguardando para configurar o wp-config.php..."
    sleep 20

    caminho_wp_config="/var/lib/docker/volumes/wordpress_${nome_site_wordpress}/_data/wp-config.php"
    if [ -f "$caminho_wp_config" ]; then
        sed -i "/\/\* Add any custom values between this line and the \"stop editing\" line. \*\//a \
define( 'WP_REDIS_HOST', 'redis' );\n\
define( 'WP_REDIS_PORT', 6379 );\n" "$caminho_wp_config"
        docker service update --force "wordpress_${nome_site_wordpress}_wordpress_${nome_site_wordpress}" > /dev/null 2>&1
    else
        echo "Arquivo wp-config.php não encontrado, pule a configuração do Redis."
    fi

    cd /root/dados_vps
    cat > dados_wordpress_${nome_site_wordpress} <<EOL
[ WORDPRESS ]
Dominio: https://${url_wordpress}
Arquivos do site: /var/lib/docker/volumes/wordpress_${nome_site_wordpress}/_data
Arquivos do php: /var/lib/docker/volumes/wordpress_${nome_site_wordpress}_php/_data
EOL
    cd

    msg_resumo_informacoes
    echo -e "\e[32m[ WORDPRESS ]\e[0m\n"
    echo -e "\e[33m🌐 Domínio:\e[97m https://${url_wordpress}\e[0m"
    echo -e "\e[33m⚠️  Acesse o domínio para completar a instalação e criar seu usuário admin.\e[0m"
    msg_retorno_menu
}

ferramenta_formbricks() {
  msg_formbricks
  dados

  while true; do
    echo -e "\n📍 Passo 1/6"
    echo -en "🔗 \e[33mDigite o domínio para o Formbricks (ex: forms.encha.ai): \e[0m" && read -r url_formbricks
    echo -e "\n📍 Passo 2/6"
    echo -en "📧 \e[33mDigite o Email para SMTP (ex: noreply@encha.ai): \e[0m" && read -r email_formbricks
    echo -e "\n📍 Passo 3/6"
    echo -en "👤 \e[33mDigite o Usuário para SMTP (pode ser o mesmo email): \e[0m" && read -r user_smtp_formbricks
    echo -e "\n📍 Passo 4/6"
    echo -en "🔑 \e[33mDigite a Senha SMTP do email: \e[0m" && read -s -r senha_formbricks
    echo ""
    echo -e "\n📍 Passo 5/6"
    echo -en "🏠 \e[33mDigite o Host SMTP do email (ex: smtp.hostinger.com): \e[0m" && read -r host_formbricks
    echo -e "\n📍 Passo 6/6"
    echo -en "🔌 \e[33mDigite a porta SMTP do email (ex: 465 ou 587): \e[0m" && read -r porta_formbricks

    if [ "$porta_formbricks" -eq 465 ] || [ "$porta_formbricks" -eq 25 ]; then
      ssl_formbricks=1
    else
      ssl_formbricks=0
    fi

    clear
    msg_formbricks
    echo -e "\e[33m🔍 Por favor, revise as informações abaixo:\e[0m\n"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "🌐 \e[33mDomínio:\e[97m $url_formbricks\e[0m"
    echo -e "📧 \e[33mEmail SMTP:\e[97m $email_formbricks\e[0m"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    read -p $'\n\e[32m✅ As respostas estão corretas?\e[0m \e[33m(Y/N)\e[0m: ' confirmacao
    if [[ "$confirmacao" =~ ^[Yy]$ ]]; then break; else msg_formbricks; fi
  done

  clear
  echo -e "\e[97m🚀 Iniciando a instalação do Formbricks...\e[0m"
  verificar_container_pgvector || ferramenta_pgvector
  pegar_senha_pgvector
  criar_banco_pgvector_da_stack "formbricks"

  encryption_key_form=$(openssl rand -hex 32)
  next_key_form=$(openssl rand -hex 32)
  cron_key_form=$(openssl rand -hex 32)

  cat > formbricks.yaml <<EOL
version: "3.7"
services:

## --------------------------- ORION --------------------------- ##

  formbricks:
    image: ghcr.io/formbricks/formbricks:latest

    volumes:
      - formbricks_data:/home/nextjs/apps/web/uploads/

    networks:
      - $nome_rede_interna

    environment:
      ## Url da aplicação
      - WEBAPP_URL=https://$url_formbricks
      - NEXTAUTH_URL=https://$url_formbricks

      ## Banco de dados Postgres
      - DATABASE_URL=postgresql://postgres:$senha_pgvector@pgvector:5432/formbricks?schema=public

      ## Licença Enterprise ou Self-hosting
      ## Solicitar licenta Self-hosting --> https://oriondesign.art.br/formbricks_licence/ <-- ##
      - ENTERPRISE_LICENSE_KEY=

      ## Keys aleatórias 32 caracteres
      - ENCRYPTION_KEY=$encryption_key_form
      - NEXTAUTH_SECRET=$next_key_form
      - CRON_SECRET=$cron_key_form

      ## Dados do SMTP
      - MAIL_FROM=$email_formbricks
      - SMTP_HOST=$host_formbricks
      - SMTP_PORT=$porta_formbricks
      - SMTP_SECURE_ENABLED=$ssl_formbricks #(0= false | 1= true)
      - SMTP_USER=$user_smtp_formbricks
      - SMTP_PASSWORD=$senha_formbricks

      ## Ativar/Desativar registros e convites (0= false | 1= true)
      - SIGNUP_DISABLED=0
      - INVITE_DISABLED=0
      - EMAIL_VERIFICATION_DISABLED=0
      - PASSWORD_RESET_DISABLED=0

      ## Dados do Formbricks (para pesquisa)
      - NEXT_PUBLIC_FORMBRICKS_API_HOST=
      - NEXT_PUBLIC_FORMBRICKS_ENVIRONMENT_ID=
      - NEXT_PUBLIC_FORMBRICKS_ONBOARDING_SURVEY_ID=

      ## Login Google Cloud
      - GOOGLE_AUTH_ENABLED=0
      - GOOGLE_CLIENT_ID=
      - GOOGLE_CLIENT_SECRET=

      ## Google Sheets
      - GOOGLE_SHEETS_CLIENT_ID=
      - GOOGLE_SHEETS_CLIENT_SECRET=
      - GOOGLE_SHEETS_REDIRECT_URL=

      ## Login Github
      - GITHUB_AUTH_ENABLED=0
      - GITHUB_ID=
      - GITHUB_SECRET=

      ## Login Github
      - NOTION_OAUTH_CLIENT_ID=
      - NOTION_OAUTH_CLIENT_SECRET=   
      
      ## Login Airtable
      - AIRTABLE_CLIENT_ID=

      ## Termos e politica de privacidade
      #- PRIVACY_URL=
      #- TERMS_URL=
      #- IMPRINT_URL=

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
        - traefik.http.routers.formbricks.rule=Host(\`$url_formbricks\`)
        - traefik.http.services.formbricks.loadbalancer.server.port=3000
        - traefik.http.routers.formbricks.service=formbricks
        - traefik.http.routers.formbricks.tls.certresolver=letsencryptresolver
        - traefik.http.routers.formbricks.entrypoints=websecure
        - traefik.http.routers.formbricks.tls=true

## --------------------------- ORION --------------------------- ##

volumes:
  formbricks_data:
    external: true
    name: formbricks_data

networks:
  $nome_rede_interna:
    name: $nome_rede_interna
    external: true
EOL

  STACK_NAME="formbricks"
  stack_editavel
  wait_stack "formbricks_formbricks"

  cd /root/dados_vps
  cat > dados_formbricks <<EOL
[ FORMBRICKS ]
Dominio: https://$url_formbricks
Usuario: (criado no primeiro acesso)
Senha: (criada no primeiro acesso)
EOL

  cd
  
  msg_resumo_informacoes
  echo -e "\e[32m[ FORMBRICKS ]\e[0m\n"
  echo -e "\e[33m🌐 Domínio:\e[97m https://$url_formbricks\e[0m"
  echo -e "\e[33m⚠️  Aguarde aproximadamente 5 minutos antes de acessar devido à migração do banco de dados.\e[0m"
  msg_retorno_menu
}

ferramenta_metabase() {
    msg_metabase
    dados

    while true; do
        echo -e "\n📍 Passo 1/1"
        echo -en "🔗 \e[33mDigite o domínio para o Metabase (ex: bi.encha.ai): \e[0m" && read -r url_metabase
        echo ""

        clear
        msg_metabase
        echo -e "\e[33m🔍 Por favor, revise as informações abaixo:\e[0m\n"
        echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo -e "🌐 \e[33mDomínio Metabase:\e[97m $url_metabase\e[0m"
        echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        read -p $'\n\e[32m✅ As respostas estão corretas?\e[0m \e[33m(Y/N)\e[0m: ' confirmacao
        if [[ "$confirmacao" =~ ^[Yy]$ ]]; then break; else msg_metabase; fi
    done

    clear
    echo -e "\e[97m🚀 Iniciando a instalação do Metabase...\e[0m"
    verificar_container_postgres || ferramenta_postgres
    pegar_senha_postgres
    criar_banco_postgres_da_stack "metabase"

    # Gerando chave de criptografia para a segurança do banco de dados do Metabase
    encryption_key=$(openssl rand -hex 32)

    cat > metabase.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  metabase:
    image: metabase/metabase:latest
    volumes:
      - metabase_data:/metabase-data # <-- CORRIGIDO: Caminho padrão do volume
    networks:
      - $nome_rede_interna
    environment:
      # URLs e Configurações de Rede
      - MB_SITE_URL=https://$url_metabase
      - MB_JETTY_PORT=3000

      # Configurações do Banco de Dados do Metabase
      - MB_DB_TYPE=postgres
      - MB_DB_DBNAME=metabase
      - MB_DB_PORT=5432
      - MB_DB_USER=postgres
      - MB_DB_PASS=$senha_postgres
      - MB_DB_HOST=postgres
      - MB_AUTOMIGRATE=true # <-- ALTERADO para "true" para uma inicialização mais suave

      # Chave de Criptografia para segurança
      - MB_ENCRYPTION_SECRET_KEY=$encryption_key # <-- ADICIONADO: Corrige o aviso de segurança dos logs

    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.metabase.rule=Host(\`$url_metabase\`)"
        - "traefik.http.services.metabase.loadbalancer.server.port=3000"
        - "traefik.http.routers.metabase.service=metabase"
        - "traefik.http.routers.metabase.entrypoints=websecure"
        - "traefik.http.routers.metabase.tls.certresolver=letsencryptresolver"
volumes:
  metabase_data:
    external: true
    name: metabase_data
networks:
  $nome_rede_interna:
    external: true
    name: $nome_rede_interna
EOL
    
    STACK_NAME="metabase"
    stack_editavel
    wait_stack "metabase_metabase"

    cd /root/dados_vps
    cat > dados_metabase <<EOL
[ METABASE ]
Dominio: https://$url_metabase
Usuario: (criado no primeiro acesso)
Senha: (criada no primeiro acesso)
EOL
    cd
    
    msg_resumo_informacoes
    echo -e "\e[32m[ METABASE ]\e[0m\n"
    echo -e "\e[33m🌐 Domínio:\e[97m https://$url_metabase\e[0m"
    echo -e "\e[33m⚠️  Acesse o domínio para completar a instalação e criar seu usuário.\e[0m"
    msg_retorno_menu
}

ferramenta_docuseal() {
    msg_docuseal
    dados

    while true; do
        echo -e "\n📍 Passo 1/6"
        echo -en "🔗 \e[33mDigite o domínio para o Docuseal (ex: assine.encha.ai): \e[0m" && read -r url_docuseal
        echo ""
        echo -e "\n📍 Passo 2/6"
        echo -en "📧 \e[33mDigite o Email para SMTP (ex: noreply@encha.ai): \e[0m" && read -r email_smtp_docuseal
        echo ""
        echo -e "\n📍 Passo 3/6"
        echo -en "👤 \e[33mDigite o Usuário para SMTP (pode ser o mesmo email): \e[0m" && read -r user_smtp_docuseal
        echo ""
        echo -e "\n📍 Passo 4/6"
        echo -en "🔑 \e[33mDigite a Senha SMTP do email: \e[0m" && read -s -r senha_smtp_docuseal
        echo ""
        echo -e "\n📍 Passo 5/6"
        echo -en "🏠 \e[33mDigite o Host SMTP do email (ex: smtp.hostinger.com): \e[0m" && read -r host_smtp_docuseal
        echo ""
        echo -e "\n📍 Passo 6/6"
        echo -en "🔌 \e[33mDigite a porta SMTP do email (ex: 465 ou 587): \e[0m" && read -r porta_smtp_docuseal
        echo ""

        clear
        msg_docuseal
        echo -e "\e[33m🔍 Por favor, revise as informações abaixo:\e[0m\n"
        echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo -e "🌐 \e[33mDomínio Docuseal:\e[97m $url_docuseal\e[0m"
        echo -e "📧 \e[33mEmail SMTP:\e[97m $email_smtp_docuseal\e[0m"
        echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        read -p $'\n\e[32m✅ As respostas estão corretas?\e[0m \e[33m(Y/N)\e[0m: ' confirmacao
        if [[ "$confirmacao" =~ ^[Yy]$ ]]; then break; else msg_docuseal; fi
    done

    clear
    echo -e "\e[97m🚀 Iniciando a instalação do Docuseal...\e[0m"
    verificar_container_postgres || ferramenta_postgres
    pegar_senha_postgres
    criar_banco_postgres_da_stack "docuseal"
    verificar_minio || ferramenta_minio
    pegar_senha_minio
    criar_bucket.minio "docuseal"
    
    key_docuseal=$(openssl rand -hex 32)
    
    cat > docuseal.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  docuseal:
    image: docuseal/docuseal:latest
    volumes:
      - docuseal_data:/data
    networks:
      - $nome_rede_interna
    environment:
      - HOST=$url_docuseal
      - FORCE_SSL=true
      - SECRET_KEY_BASE=$key_docuseal
      - DATABASE_URL=postgresql://postgres:$senha_postgres@postgres:5432/docuseal
      - SMTP_USERNAME=$user_smtp_docuseal
      - SMTP_PASSWORD=$senha_smtp_docuseal
      - SMTP_ADDRESS=$host_smtp_docuseal
      - SMTP_PORT=$porta_smtp_docuseal
      - SMTP_FROM=$email_smtp_docuseal
      - SMTP_DOMAIN=$(echo "$email_smtp_docuseal" | cut -d'@' -f2)
      - SMTP_AUTHENTICATION=login
      - AWS_ACCESS_KEY_ID=$S3_ACCESS_KEY
      - AWS_SECRET_ACCESS_KEY=$S3_SECRET_KEY
      - S3_ATTACHMENTS_BUCKET=docuseal
      - S3_ATTACHMENTS_ENDPOINT=https://$url_s3
      - S3_ATTACHMENTS_REGION=us-east-1
      - S3_FORCE_PATH_STYLE=true
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints: [node.role == manager]
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.docuseal.rule=Host(\`$url_docuseal\`)"
        - "traefik.http.services.docuseal.loadbalancer.server.port=3000"
        - "traefik.http.routers.docuseal.service=docuseal"
        - "traefik.http.routers.docuseal.tls.certresolver=letsencryptresolver"
        - "traefik.http.routers.docuseal.entrypoints=websecure"
volumes:
  docuseal_data:
    name: docuseal_data
    external: true
networks:
  $nome_rede_interna:
    external: true
EOL
    
    STACK_NAME="docuseal"
    stack_editavel
    wait_stack "docuseal_docuseal"

    cd /root/dados_vps
    cat > dados_docuseal <<EOL
[ DOCUSEAL ]
Dominio: https://$url_docuseal
Usuario: (criado no primeiro acesso)
Senha: (criada no primeiro acesso)
EOL
    cd
    
    msg_resumo_informacoes
    echo -e "\e[32m[ DOCUSEAL ]\e[0m\n"
    echo -e "\e[33m🌐 Domínio:\e[97m https://$url_docuseal\e[0m"
    echo -e "\e[33m⚠️  Acesse o domínio para completar a instalação e criar seu usuário.\e[0m"
    msg_retorno_menu
}

ferramenta_monitor() {
    msg_monitor
    dados

    while true; do
        echo -e "\n📍 Passo 1/4"
        echo -en "🔗 \e[33mDigite o domínio para o Grafana (ex: grafana.encha.ai): \e[0m" && read -r url_grafana
        echo ""
        echo -e "\n📍 Passo 2/4"
        echo -en "🔗 \e[33mDigite o domínio para o Prometheus (ex: prometheus.encha.ai): \e[0m" && read -r url_prometheus
        echo ""
        echo -e "\n📍 Passo 3/4"
        echo -en "🔗 \e[33mDigite o domínio para o cAdvisor (ex: cadvisor.encha.ai): \e[0m" && read -r url_cadvisor
        echo ""
        echo -e "\n📍 Passo 4/4"
        echo -en "🔗 \e[33mDigite o domínio para o NodeExporter (ex: node.encha.ai): \e[0m" && read -r url_nodeexporter
        echo ""

        clear
        msg_monitor
        echo -e "\e[33m🔍 Por favor, revise as informações abaixo:\e[0m\n"
        echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo -e "📊 \e[33mDomínio Grafana:\e[97m $url_grafana\e[0m"
        echo -e "🔥 \e[33mDomínio Prometheus:\e[97m $url_prometheus\e[0m"
        echo -e "🐋 \e[33mDomínio cAdvisor:\e[97m $url_cadvisor\e[0m"
        echo -e "💻 \e[33mDomínio NodeExporter:\e[97m $url_nodeexporter\e[0m"
        echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        read -p $'\n\e[32m✅ As respostas estão corretas?\e[0m \e[33m(Y/N)\e[0m: ' confirmacao
        if [[ "$confirmacao" =~ ^[Yy]$ ]]; then break; else msg_monitor; fi
    done

    clear
    echo -e "\e[97m🚀 Iniciando a instalação do Monitoramento...\e[0m"
    
    echo "Baixando e configurando arquivos..."
    mkdir -p /opt/monitor-stack/prometheus /opt/monitor-stack/grafana/provisioning/datasources /opt/monitor-stack/grafana/provisioning/dashboards
    
    cat > /opt/monitor-stack/prometheus/prometheus.yml <<EOL
global:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  scrape_interval: 15s
scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
EOL

    cat > /opt/monitor-stack/grafana/provisioning/datasources/datasource.yml <<EOL
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    url: http://prometheus:9090
    isDefault: true
    access: proxy
    editable: true
EOL

    cat > monitor.yaml <<EOL
version: '3.7'
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  prometheus:
    image: prom/prometheus:latest
    volumes:
      - /opt/monitor-stack/prometheus:/etc/prometheus
    networks:
      - $nome_rede_interna
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints: [node.role == manager]
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.prometheus.rule=Host(\`$url_prometheus\`)"
        - "traefik.http.services.prometheus.loadbalancer.server.port=9090"
        - "traefik.http.routers.prometheus.service=prometheus"
        - "traefik.http.routers.prometheus.entrypoints=websecure"
        - "traefik.http.routers.prometheus.tls.certresolver=letsencryptresolver"

  grafana:
    image: grafana/grafana:latest
    volumes:
      - /opt/monitor-stack/grafana/provisioning/datasources:/etc/grafana/provisioning/datasources
    networks:
      - $nome_rede_interna
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints: [node.role == manager]
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.grafana.rule=Host(\`$url_grafana\`)"
        - "traefik.http.services.grafana.loadbalancer.server.port=3000"
        - "traefik.http.routers.grafana.service=grafana"
        - "traefik.http.routers.grafana.entrypoints=websecure"
        - "traefik.http.routers.grafana.tls.certresolver=letsencryptresolver"

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  node-exporter:
    image: prom/node-exporter:latest
    networks:
      - $nome_rede_interna
    deploy:
      mode: global
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.node-exporter.rule=Host(\`$url_nodeexporter\`)"
        - "traefik.http.services.node-exporter.loadbalancer.server.port=9100"
        - "traefik.http.routers.node-exporter.service=node-exporter"
        - "traefik.http.routers.node-exporter.entrypoints=websecure"
        - "traefik.http.routers.node-exporter.tls.certresolver=letsencryptresolver"

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:rw
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    networks:
      - $nome_rede_interna
    deploy:
      mode: global
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.cadvisor.rule=Host(\`$url_cadvisor\`)"
        - "traefik.http.services.cadvisor.loadbalancer.server.port=8080"
        - "traefik.http.routers.cadvisor.service=cadvisor"
        - "traefik.http.routers.cadvisor.entrypoints=websecure"
        - "traefik.http.routers.cadvisor.tls.certresolver=letsencryptresolver"

networks:
  $nome_rede_interna:
    external: true
EOL

    STACK_NAME="monitor"
    stack_editavel
    wait_stack "monitor_prometheus" "monitor_grafana" "monitor_node-exporter" "monitor_cadvisor"

    cd /root/dados_vps
    cat > dados_monitor <<EOL
[ MONITORAMENTO ]
Dominio Grafana: https://$url_grafana
Usuario Grafana: admin
Senha Grafana: admin (alterar no primeiro acesso)

Dominio Prometheus: https://$url_prometheus
Dominio cAdvisor: https://$url_cadvisor
Dominio NodeExporter: https://$url_nodeexporter
EOL
    cd
    
    msg_resumo_informacoes
    echo -e "\e[32m[ MONITORAMENTO ]\e[0m\n"
    echo -e "📊 \e[33mGrafana:\e[97m https://$url_grafana\e[0m (user: admin, pass: admin)"
    echo -e "🔥 \e[33mPrometheus:\e[97m https://$url_prometheus\e[0m"
    echo -e "🐋 \e[33mcAdvisor:\e[97m https://$url_cadvisor\e[0m"
    echo -e "💻 \e[33mNodeExporter:\e[97m https://$url_nodeexporter\e[0m"
    msg_retorno_menu
}

ferramenta_dify() {
    msg_dify
    dados

    while true; do
        echo -e "\n📍 Passo 1/7"
        echo -en "🔗 \e[33mDigite o domínio para a interface Web do Dify (ex: dify.encha.ai): \e[0m" && read -r url_dify
        echo ""
        echo -e "\n📍 Passo 2/7"
        echo -en "🔗 \e[33mDigite o domínio para a API do Dify (ex: api-dify.encha.ai): \e[0m" && read -r url_dify_api
        echo ""
        echo -e "\n📍 Passo 3/7"
        echo -en "📧 \e[33mDigite o Email para SMTP (ex: noreply@encha.ai): \e[0m" && read -r email_dify
        echo ""
        echo -e "\n📍 Passo 4/7"
        echo -en "👤 \e[33mDigite o Usuário para SMTP (pode ser o mesmo email): \e[0m" && read -r user_email_dify
        echo ""
        echo -e "\n📍 Passo 5/7"
        echo -en "🔑 \e[33mDigite a Senha SMTP do email: \e[0m" && read -s -r senha_email_dify
        echo ""
        echo -e "\n📍 Passo 6/7"
        echo -en "🏠 \e[33mDigite o Host SMTP do email (ex: smtp.hostinger.com): \e[0m" && read -r smtp_email_dify
        echo ""
        echo -e "\n📍 Passo 7/7"
        echo -en "🔌 \e[33mDigite a porta SMTP do email (ex: 465 ou 587): \e[0m" && read -r porta_smtp_dify
        echo ""

        clear
        msg_dify
        echo -e "\e[33m🔍 Por favor, revise as informações abaixo:\e[0m\n"
        echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo -e "🌐 \e[33mDomínio Web Dify:\e[97m $url_dify\e[0m"
        echo -e "🔗 \e[33mDomínio API Dify:\e[97m $url_dify_api\e[0m"
        echo -e "📧 \e[33mEmail SMTP:\e[97m $email_dify\e[0m"
        echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        read -p $'\n\e[32m✅ As respostas estão corretas?\e[0m \e[33m(Y/N)\e[0m: ' confirmacao
        if [[ "$confirmacao" =~ ^[Yy]$ ]]; then break; else msg_dify; fi
    done

    clear
    echo -e "\e[97m🚀 Iniciando a instalação do Dify AI...\e[0m"
    verificar_container_postgres || ferramenta_postgres
    pegar_senha_postgres
    criar_banco_postgres_da_stack "dify"
    criar_banco_postgres_da_stack "dify_plugin"
    verificar_container_redis || ferramenta_redis
    verificar_minio || ferramenta_minio
    pegar_senha_minio
    criar_bucket.minio "dify"

    secret_key=$(openssl rand -hex 32)
    token_weaviate=$(openssl rand -hex 32)

    cat > dify.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  dify_api:
    image: langgenius/dify-api:latest
    volumes:
      - dify_storage:/app/api/storage
    networks:
      - $nome_rede_interna
    environment:
      - CONSOLE_WEB_URL=https://$url_dify
      - APP_WEB_URL=https://$url_dify
      - API_URL=https://$url_dify_api
      - SERVICE_API_URL=https://$url_dify_api
      - MAIL_TYPE=smtp
      - MAIL_DEFAULT_SEND_FROM=$email_dify
      - SMTP_SERVER=$smtp_email_dify
      - SMTP_PORT=$porta_smtp_dify
      - SMTP_USERNAME=$user_email_dify
      - SMTP_PASSWORD=$senha_email_dify
      - SMTP_USE_TLS=true
      - DB_USERNAME=postgres
      - DB_PASSWORD=$senha_postgres
      - DB_HOST=postgres
      - DB_DATABASE=dify
      - REDIS_HOST=redis
      - REDIS_DB=0
      - CELERY_BROKER_URL=redis://redis:6379/1
      - STORAGE_TYPE=s3
      - S3_ENDPOINT=https://$url_s3
      - S3_BUCKET_NAME=dify
      - S3_ACCESS_KEY=$S3_ACCESS_KEY
      - S3_SECRET_KEY=$S3_SECRET_KEY
      - S3_REGION=us-east-1
      - VECTOR_STORE=weaviate
      - WEAVIATE_ENDPOINT=http://dify_weaviate:8080
      - WEAVIATE_API_KEY=$token_weaviate
      - SECRET_KEY=$secret_key
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints: [node.role == manager]
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.dify_api.rule=Host(\`$url_dify_api\`)"
        - "traefik.http.services.dify_api.loadbalancer.server.port=5001"
        - "traefik.http.routers.dify_api.service=dify_api"
        - "traefik.http.routers.dify_api.entrypoints=websecure"
        - "traefik.http.routers.dify_api.tls.certresolver=letsencryptresolver"

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  dify_worker:
    image: langgenius/dify-api:latest
    command: worker
    volumes:
      - dify_storage:/app/api/storage
    networks:
      - $nome_rede_interna
    environment:
      - CONSOLE_WEB_URL=https://$url_dify
      - APP_WEB_URL=https://$url_dify
      - API_URL=https://$url_dify_api
      - SERVICE_API_URL=https://$url_dify_api
      - DB_USERNAME=postgres
      - DB_PASSWORD=$senha_postgres
      - DB_HOST=postgres
      - DB_DATABASE=dify
      - REDIS_HOST=redis
      - REDIS_DB=0
      - CELERY_BROKER_URL=redis://redis:6379/1
      - STORAGE_TYPE=s3
      - S3_ENDPOINT=https://$url_s3
      - S3_BUCKET_NAME=dify
      - S3_ACCESS_KEY=$S3_ACCESS_KEY
      - S3_SECRET_KEY=$S3_SECRET_KEY
      - VECTOR_STORE=weaviate
      - WEAVIATE_ENDPOINT=http://dify_weaviate:8080
      - WEAVIATE_API_KEY=$token_weaviate
      - SECRET_KEY=$secret_key
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints: [node.role == manager]

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  dify_web:
    image: langgenius/dify-web:latest
    networks:
      - $nome_rede_interna
    environment:
      - CONSOLE_API_URL=https://$url_dify_api
      - APP_API_URL=https://$url_dify_api
      - API_URL=https://$url_dify_api
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints: [node.role == manager]
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.dify_web.rule=Host(\`$url_dify\`)"
        - "traefik.http.services.dify_web.loadbalancer.server.port=3000"
        - "traefik.http.routers.dify_web.service=dify_web"
        - "traefik.http.routers.dify_web.entrypoints=websecure"
        - "traefik.http.routers.dify_web.tls.certresolver=letsencryptresolver"

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  dify_weaviate:
    image: semitechnologies/weaviate:latest
    volumes:
      - dify_weaviate:/var/lib/weaviate
    networks:
      - $nome_rede_interna
    environment:
      - PERSISTENCE_DATA_PATH=/var/lib/weaviate
      - QUERY_DEFAULTS_LIMIT=25
      - AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=false
      - AUTHENTICATION_APIKEY_ENABLED=true
      - AUTHENTICATION_APIKEY_ALLOWED_KEYS=$token_weaviate
      - AUTHENTICATION_APIKEY_USERS=dify
      - AUTHORIZATION_ADMINLIST_ENABLED=false
      - CLUSTER_HOSTNAME=node1
      - DISABLE_TELEMETRY=true
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints: [node.role == manager]

volumes:
  dify_storage:
    name: dify_storage
    external: true
  dify_weaviate:
    name: dify_weaviate
    external: true

networks:
  $nome_rede_interna:
    external: true
EOL

    STACK_NAME="dify"
    stack_editavel
    wait_stack "dify_dify_api" "dify_dify_worker" "dify_dify_web" "dify_dify_weaviate"

    cd /root/dados_vps
    cat > dados_dify <<EOL
[ DIFY AI ]
Dominio Web: https://$url_dify
Dominio API: https://$url_dify_api
Usuario: (criado no primeiro acesso)
Senha: (criada no primeiro acesso)
EOL
    cd
    
    msg_resumo_informacoes
    echo -e "\e[32m[ DIFY AI ]\e[0m\n"
    echo -e "🌐 \e[33mWeb:\e[97m https://$url_dify\e[0m"
    echo -e "🔗 \e[33mAPI:\e[97m https://$url_dify_api\e[0m"
    echo -e "⚠️ \e[33m Aguarde alguns minutos para a migração do banco antes do primeiro acesso.\e[0m"
    msg_retorno_menu
}

ferramenta_affine() {
    msg_affine
    dados

    while true; do
        echo -e "\n📍 Passo 1/7"
        echo -en "🔗 \e[33mDigite o domínio para o Affine (ex: affine.encha.ai): \e[0m" && read -r url_affine
        echo ""
        echo -e "\n📍 Passo 2/7"
        echo -en "📧 \e[33mDigite o email do administrador: \e[0m" && read -r email_affine
        echo ""
        echo -e "\n📍 Passo 3/7"
        echo -en "🔑 \e[33mDigite a senha do administrador: \e[0m" && read -s -r senha_affine
        echo ""
        echo -e "\n\e[97m--- Configuração de E-mail (SMTP) ---\e[0m"
        echo -e "\n📍 Passo 4/7"
        echo -en "📧 \e[33mDigite o seu email de envio (ex: noreply@encha.ai): \e[0m" && read -r email_smtp_affine
        echo ""
        echo -e "\n📍 Passo 5/7"
        echo -en "🔑 \e[33mDigite a senha do seu email de envio: \e[0m" && read -s -r senha_smtp_affine
        echo ""
        echo -e "\n📍 Passo 6/7"
        echo -en "🏠 \e[33mDigite o host SMTP (ex: smtp.hostinger.com): \e[0m" && read -r host_smtp_affine
        echo ""
        echo -e "\n📍 Passo 7/7"
        echo -en "🔌 \e[33mDigite a porta SMTP (ex: 465): \e[0m" && read -r porta_smtp_affine
        echo ""

        clear
        msg_affine
        echo -e "\e[33m🔍 Por favor, revise as informações abaixo:\e[0m\n"
        echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo -e "🌐 \e[33mDomínio Affine:\e[97m $url_affine\e[0m"
        echo -e "📧 \e[33mEmail Admin:\e[97m $email_affine\e[0m"
        echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        read -p $'\n\e[32m✅ As respostas estão corretas?\e[0m \e[33m(Y/N)\e[0m: ' confirmacao
        if [[ "$confirmacao" =~ ^[Yy]$ ]]; then break; else msg_affine; fi
    done

    clear
    echo -e "\e[97m🚀 Iniciando a instalação do Affine...\e[0m"
    verificar_container_postgres || ferramenta_postgres
    pegar_senha_postgres
    criar_banco_postgres_da_stack "affine"
    verificar_container_redis || ferramenta_redis

    cat > affine.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  affine:
    image: ghcr.io/toeverything/affine-graphql:stable-39476d1
    command:
      ['sh', '-c', 'node ./scripts/self-host-predeploy && node ./dist/index.js']

    volumes:
      - affine_config:/root/.affine/config:rw
      - affine_storage:/root/.affine/storage:rw

    networks:
      - $nome_rede_interna

    #ports:
    #  - 3010:3010
    #  - 5555:5555

    logging:
      driver: 'json-file'
      options:
        max-size: '1000m'
    restart: on-failure:5

    environment:
      ## Dados de acesso
      - AFFINE_ADMIN_EMAIL=$email_affine
      - AFFINE_ADMIN_PASSWORD=$senha_affine
      - AFFINE_SERVER_HOST=$url_affine

      ## Dados do SMTP
      - MAILER_USER=$email_smtp_affine
      - MAILER_PASSWORD=$senha_smtp_affine
      - MAILER_HOST=$host_smtp_affine
      - MAILER_PORT=$porta_smtp_affine

      ## Dados do Postgres
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=$senha_postgres
      - POSTGRES_DB=affine
      - DATABASE_URL=postgres://postgres:$senha_postgres@postgres:5432/affine?sslmode=disable
      - PGDATA=/var/lib/postgresql/data/pgdata

      ## Outras configurações
      - NODE_OPTIONS="--import=./scripts/register.js"
      - AFFINE_CONFIG_PATH=/root/.affine/config
      - REDIS_SERVER_HOST=redis
      - NODE_ENV=production
      
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.affine.rule=Host(\`$url_affine\`)
        - traefik.http.services.affine.loadbalancer.server.port=3010
        - traefik.http.routers.affine.service=affine
        - traefik.http.routers.affine.tls.certresolver=letsencryptresolver
        - traefik.http.routers.affine.entrypoints=websecure
        - traefik.http.routers.affine.tls=true
        - traefik.frontend.headers.STSPreload=true
        - traefik.frontend.headers.STSSeconds=31536000

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

volumes:
  affine_config:
    external: true
    name: affine_config
  affine_storage:
    external: true
    name: affine_storage

networks:
  $nome_rede_interna:
    external: true
    name: $nome_rede_interna
EOL

    STACK_NAME="affine"
    stack_editavel
    wait_stack "affine_affine"

    cd /root/dados_vps
    cat > dados_affine <<EOL
[ AFFINE ]
Dominio: https://$url_affine
Usuario: $email_affine
Senha: $senha_affine
EOL
    cd
    
    msg_resumo_informacoes
    echo -e "\e[32m[ AFFINE ]\e[0m\n"
    echo -e "\e[33m🌐 Domínio:\e[97m https://$url_affine\e[0m"
    echo -e "\e[33m📧 Usuário Admin:\e[97m $email_affine\e[0m"
    echo -e "\e[33m🔑 Senha Admin:\e[97m $senha_affine\e[0m"
    msg_retorno_menu
}

ferramenta_vaultwarden() {
    msg_vaultwarden
    dados

    while true; do
        echo -e "\n📍 Passo 1/5"
        echo -en "🔗 \e[33mDigite o domínio para o Vaultwarden (ex: senhas.encha.ai): \e[0m" && read -r url_vaultwarden
        echo ""
        echo -e "\n\e[97m--- Configuração de E-mail (SMTP) ---\e[0m"
        echo -e "\n📍 Passo 2/5"
        echo -en "📧 \e[33mDigite seu email de envio (ex: noreply@encha.ai): \e[0m" && read -r email_vaultwarden
        echo ""
        echo -e "\n📍 Passo 3/5"
        echo -en "🔑 \e[33mDigite a senha do seu email: \e[0m" && read -s -r senha_vaultwarden
        echo ""
        echo -e "\n📍 Passo 4/5"
        echo -en "🏠 \e[33mDigite o host SMTP (ex: smtp.hostinger.com): \e[0m" && read -r host_vaultwarden
        echo ""
        echo -e "\n📍 Passo 5/5"
        echo -en "🔌 \e[33mDigite a porta SMTP (ex: 465): \e[0m" && read -r porta_vaultwarden
        echo ""

        if [ "$porta_vaultwarden" -eq 465 ] || [ "$porta_vaultwarden" -eq 25 ]; then
            ssl_vaultwarden=force_tls
        else
            ssl_vaultwarden=starttls
        fi

        clear
        msg_vaultwarden
        echo -e "\e[33m🔍 Por favor, revise as informações abaixo:\e[0m\n"
        echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo -e "🌐 \e[33mDomínio Vaultwarden:\e[97m $url_vaultwarden\e[0m"
        echo -e "📧 \e[33mEmail SMTP:\e[97m $email_vaultwarden\e[0m"
        echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        read -p $'\n\e[32m✅ As respostas estão corretas?\e[0m \e[33m(Y/N)\e[0m: ' confirmacao
        if [[ "$confirmacao" =~ ^[Yy]$ ]]; then break; else msg_vaultwarden; fi
    done

    clear
    echo -e "\e[97m🚀 Iniciando a instalação do Vaultwarden...\e[0m"
    
    cat > vaultwarden.yaml <<EOL
version: "3.7"
services:
  vaultwarden:
    image: vaultwarden/server:latest
    volumes:
      - vaultwarden_data:/data
    networks:
      - $nome_rede_interna
    environment:
      - DOMAIN=https://$url_vaultwarden
      - SIGNUPS_ALLOWED=true
      - SMTP_FROM=$email_vaultwarden
      - SMTP_USERNAME=$email_vaultwarden
      - SMTP_PASSWORD=$senha_vaultwarden
      - SMTP_HOST=$host_vaultwarden
      - SMTP_PORT=$porta_vaultwarden
      - SMTP_SECURITY=$ssl_vaultwarden
      - WEBSOCKET_ENABLED=true
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints: [node.role == manager]
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.vaultwarden.rule=Host(\`$url_vaultwarden\`)"
        - "traefik.http.routers.vaultwarden.service=vaultwarden"
        - "traefik.http.routers.vaultwarden.entrypoints=websecure"
        - "traefik.http.services.vaultwarden.loadbalancer.server.port=80"
        - "traefik.http.routers.vaultwarden.tls.certresolver=letsencryptresolver"
volumes:
  vaultwarden_data:
    name: vaultwarden_data
    external: true
networks:
  $nome_rede_interna:
    external: true
EOL

    STACK_NAME="vaultwarden"
    stack_editavel
    wait_stack "vaultwarden_vaultwarden"

    cd /root/dados_vps
    cat > dados_vaultwarden <<EOL
[ VAULTWARDEN ]
Dominio: https://$url_vaultwarden
Usuario: (criado no primeiro acesso)
Senha: (criada no primeiro acesso)
EOL
    cd
    
    msg_resumo_informacoes
    echo -e "\e[32m[ VAULTWARDEN ]\e[0m\n"
    echo -e "\e[33m🌐 Domínio:\e[97m https://$url_vaultwarden\e[0m"
    echo -e "\e[33m⚠️  Crie sua conta no primeiro acesso ao domínio.\e[0m"
    msg_retorno_menu
}

ferramenta_nextcloud() {
    msg_nextcloud
    dados

    while true; do
        echo -e "\n📍 Passo 1/3"
        echo -en "🔗 \e[33mDigite o domínio para o Nextcloud (ex: cloud.encha.ai): \e[0m" && read -r url_nextcloud
        echo ""
        echo -e "\n📍 Passo 2/3"
        echo -en "👤 \e[33mDigite o nome do usuário administrador: \e[0m" && read -r user_nextcloud
        echo ""
        echo -e "\n📍 Passo 3/3"
        echo -en "🔑 \e[33mDigite a senha para o administrador: \e[0m" && read -s -r pass_nextcloud
        echo ""

        clear
        msg_nextcloud
        echo -e "\e[33m🔍 Por favor, revise as informações abaixo:\e[0m\n"
        echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo -e "🌐 \e[33mDomínio Nextcloud:\e[97m $url_nextcloud\e[0m"
        echo -e "👤 \e[33mUsuário Admin:\e[97m $user_nextcloud\e[0m"
        echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        read -p $'\n\e[32m✅ As respostas estão corretas?\e[0m \e[33m(Y/N)\e[0m: ' confirmacao
        if [[ "$confirmacao" =~ ^[Yy]$ ]]; then break; else msg_nextcloud; fi
    done

    clear
    echo -e "\e[97m🚀 Iniciando a instalação do Nextcloud...\e[0m"
    verificar_container_postgres || ferramenta_postgres
    pegar_senha_postgres
    criar_banco_postgres_da_stack "nextcloud"
    verificar_container_redis || ferramenta_redis

    cat > nextcloud.yaml <<EOL
version: "3.7"
services:
  nextcloud:
    image: nextcloud:latest
    volumes:
      - nextcloud_data:/var/www/html
    networks:
      - $nome_rede_interna
    environment:
      - NEXTCLOUD_ADMIN_USER=$user_nextcloud
      - NEXTCLOUD_ADMIN_PASSWORD=$pass_nextcloud
      - POSTGRES_HOST=postgres
      - POSTGRES_DB=nextcloud
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=$senha_postgres
      - REDIS_HOST=redis
      - OVERWRITEPROTOCOL=https
      - TRUSTED_PROXIES=0.0.0.0/0
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints: [node.role == manager]
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.nextcloud.rule=Host(\`$url_nextcloud\`)"
        - "traefik.http.services.nextcloud.loadbalancer.server.port=80"
        - "traefik.http.routers.nextcloud.service=nextcloud"
        - "traefik.http.routers.nextcloud.entrypoints=websecure"
        - "traefik.http.routers.nextcloud.tls.certresolver=letsencryptresolver"
        - "traefik.http.middlewares.nextcloud-redirect.redirectregex.regex=https://(.*)/.well-known/(card|cal)dav"
        - "traefik.http.middlewares.nextcloud-redirect.redirectregex.replacement=https://\${1}/remote.php/dav/"
        - "traefik.http.routers.nextcloud.middlewares=nextcloud-redirect"

  nextcloud_cron:
    image: nextcloud:latest
    entrypoint: /cron.sh
    volumes:
      - nextcloud_data:/var/www/html
    networks:
      - $nome_rede_interna
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints: [node.role == manager]

volumes:
  nextcloud_data:
    name: nextcloud_data
    external: true
networks:
  $nome_rede_interna:
    external: true
EOL

    STACK_NAME="nextcloud"
    stack_editavel
    wait_stack "nextcloud_nextcloud" "nextcloud_nextcloud_cron"

    echo "Aguardando para aplicar configurações adicionais..."
    sleep 30
    
    local config_path="/var/lib/docker/volumes/nextcloud_data/_data/config/config.php"
    if [ -f "$config_path" ]; then
        # Adiciona o domínio à lista de trusted_domains
        docker exec $(docker ps -q --filter "name=nextcloud_nextcloud") sed -i "/'trusted_domains' =>/a \    1 => '$url_nextcloud'," "$config_path"
        echo "✅ Domínio adicionado aos trusted_domains do Nextcloud."
    else
        echo "⚠️  Arquivo de configuração do Nextcloud não encontrado. A configuração de trusted_domains pode precisar ser feita manualmente."
    fi

    cd /root/dados_vps
    cat > dados_nextcloud <<EOL
[ NEXTCLOUD ]
Dominio: https://$url_nextcloud
Usuario: $user_nextcloud
Senha: $pass_nextcloud
EOL
    cd
    
    msg_resumo_informacoes
    echo -e "\e[32m[ NEXTCLOUD ]\e[0m\n"
    echo -e "\e[33m🌐 Domínio:\e[97m https://$url_nextcloud\e[0m"
    echo -e "\e[33m👤 Usuário:\e[97m $user_nextcloud\e[0m"
    echo -e "\e[33m🔑 Senha:\e[97m $pass_nextcloud\e[0m"
    msg_retorno_menu
}

ferramenta_strapi(){
  msg_strapi
  dados

  while true; do
    echo -e "\n📍 Passo 1/1"
    echo -en "🔗 \e[33mDigite o domínio para o Strapi (ex: strapi.encha.ai): \e[0m" && read -r url_strapi
    echo ""

    clear
    msg_strapi
    echo -e "\e[33m🔍 Por favor, revise as informações abaixo:\e[0m\n"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "🌐 \e[33mDomínio Strapi:\e[97m $url_strapi\e[0m"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    read -p $'\n\e[32m✅ As respostas estão corretas?\e[0m \e[33m(Y/N)\e[0m: ' confirmacao
    if [[ "$confirmacao" =~ ^[Yy]$ ]]; then break; else msg_strapi; fi
  done

  clear
  echo -e "\e[97m🚀 Iniciando a instalação do Strapi...\e[0m"
  
  jwt_secret=$(openssl rand -hex 16)
  admin_jwt=$(openssl rand -hex 16)
  app_key=$(openssl rand -hex 16)
  senha_mysql=$(openssl rand -hex 16)

  cat > strapi.yaml <<EOL
version: "3.7"
services:

# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀

  strapi_app:
    image: strapi/strapi:4

    volumes:
      #- strapi_config:/srv/app/config
      #- strapi_src:/srv/app/src
      #- strapi_public_uploads:/srv/app/public/uploads
      - strapi_data:/srv/app

    networks:
      - $nome_rede_interna

    environment:
      ## Dados MySQL
      - DATABASE_CLIENT=mysql
      - DATABASE_HOST=strapi_db
      - DATABASE_NAME=strapi
      - DATABASE_PORT=3306
      - DATABASE_USERNAME=root
      - DATABASE_PASSWORD=$senha_mysql

      ## Secret Keys
      - JWT_SECRET=$jwt_secret
      - ADMIN_JWT_SECRET=$admin_jwt
      - APP_KEYS=$app_key

      ## Outros dados
      - NODE_ENV=production
      - STRAPI_TELEMETRY_DISABLED=true

    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.strapi.rule=Host(\`$url_strapi\`)
        - traefik.http.routers.strapi.entrypoints=web,websecure
        - traefik.http.routers.strapi.tls.certresolver=letsencryptresolver
        - traefik.http.routers.strapi.service=strapi
        - traefik.http.services.strapi.loadbalancer.server.port=1337
        - traefik.http.services.strapi.loadbalancer.passHostHeader=true


# ░█▀▀░█▀█░█▀▀░█░█░█▀█░░░░█▀█░▀█▀
# ░█▀▀░█░█░█░░░█▀█░█▀█░░░░█▀█░░█░
# ░▀▀▀░▀░▀░▀▀▀░▀░▀░▀░▀░▀░░▀░▀░▀▀▀


  strapi_db:
    image: percona/percona-server:8.0
    command:
      [
        "--character-set-server=utf8mb4",
        "--collation-server=utf8mb4_general_ci",
        "--sql-mode=",
        "--default-authentication-plugin=mysql_native_password",
        "--max-allowed-packet=512MB"
      ]

    volumes:
      - strapi_db:/var/lib/mysql

    networks:
      - $nome_rede_interna

    environment:
      - MYSQL_ROOT_PASSWORD=$senha_mysql
      - MYSQL_DATABASE=strapi
      - TZ=America/Sao_Paulo

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
  #strapi_config:
  #  external: true
  #  name: strapi_config
  #strapi_src:
  #  external: true
  #  name: strapi_src
  #strapi_public_uploads:
  #  external: true
  #  name: strapi_public_uploads
  strapi_data:
    external: true
    name: strapi_data
  strapi_db:
    external: true
    name: strapi_db

networks:
  $nome_rede_interna:
    external: true
    name: $nome_rede_interna
EOL

  STACK_NAME="strapi"
  stack_editavel

  echo -e "\e[97m• VERIFICANDO SERVIÇO \e[33m[3/3]\e[0m"

  ## Baixando imagens
  pull strapi/strapi percona/percona-server:8.0
  wait "strapi_strapi_app" "strapi_strapi_db"

  cd /root/dados_vps
  cat > dados_strapi << EOL
[ STRAPI ]
Dominio: https://$url_strapi/admin
Usuario: (criado no primeiro acesso)
Senha: (criada no primeiro acesso)
EOL

  cd
  msg_resumo_informacoes
  echo -e "\e[32m[ STRAPI ]\e[0m\n"
  echo -e "\e[33m🌐 Domínio Admin:\e[97m https://$url_strapi/admin\e[0m"
  echo -e "\e[33m⚠️  Aguarde até 5 minutos para a primeira inicialização e acesse o link para criar seu usuário.\e[0m"
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

        # Menu principal (mantido como no original, mesmo com desalinhamento)
        echo -e "${azul}01.${reset} Instalar Traefik + Portainer     ${azul}28.${reset} Instalar outline"
        echo -e "${azul}02.${reset} Instalar Evolution API           ${azul}29.${reset} Instalar focalboard"
        echo -e "${azul}03.${reset} Instalar N8N                     ${azul}30.${reset} Instalar GLPI"
        echo -e "${azul}04.${reset} Instalar Chatwoot                ${azul}31.${reset} Instalar Flowise"
        echo -e "${azul}05.${reset} Liberar Chatwoot                 ${azul}32.${reset} Instalar Langflow"
        echo -e "${azul}06.${reset} Instalar N8N Formação Encha      ${azul}33.${reset} Instalar Ollama"
        echo -e "${azul}07.${reset} Instalar Minio                   ${azul}34.${reset} Instalar Anythingllm"
        echo -e "${azul}08.${reset} Instalar Typebot                 ${azul}35.${reset} Instalar Nocodb"
        echo -e "${azul}09.${reset} Instalar Directus                ${azul}36.${reset} Instalar humhub"
        echo -e "${azul}10.${reset} Instalar Odoo                    ${azul}37.${reset} Instalar Wordpress"
        echo -e "${azul}11.${reset} Verificar status dos serviços    ${azul}38.${reset} Instalar Formbricks"
        echo -e "${azul}12.${reset} Sair do menu                     ${azul}39.${reset} Instalar MetaBase"
        echo -e "${azul}13.${reset} Instalar pgAdmin                 ${azul}40.${reset} Instalar Docuseal"
        echo -e "${azul}14.${reset} Instalar nocobase                ${azul}41.${reset} Instalar Monitor"
        echo -e "${azul}15.${reset} Instalar botpress                ${azul}42.${reset} Instalar Dify"
        echo -e "${azul}16.${reset} Instalar baserow                 ${azul}43.${reset} Instalar Affine"
        echo -e "${azul}17.${reset} Instalar mongoDB                 ${azul}44.${reset} Instalar Vaultwarden"
        echo -e "${azul}18.${reset} Instalar rabbitMQ                ${azul}45.${reset} Instalar Nextcloud"
        echo -e "${azul}19.${reset} Instalar uptimeKuma              ${azul}46.${reset} Instalar Strapi"
        echo -e "${azul}20.${reset} Instalar calcom"
        echo -e "${azul}21.${reset} Instalar mautic"
        echo -e "${azul}22.${reset} Instalar appsmith"
        echo -e "${azul}23.${reset} Instalar qdrant"
        echo -e "${azul}24.${reset} Instalar woofedcrm"
        echo -e "${azul}26.${reset} Instalar twentyCRM"
        echo -e "${azul}27.${reset} Instalar Mattermost" 
        echo ""
        echo -en "${amarelo}👉 Escolha uma opção (1-45): ${reset}"
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
                # Este case não precisa de verificação de stack, pois é uma ação
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
            # CORREÇÃO: O case 07|7 estava faltando e seu conteúdo estava misturado no 06|6. Agora está separado.
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
                    ## FIM TOKEN
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
            # A partir daqui, casos mais simples que não usavam o padrão de TOKEN
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
            23)
                verificar_stack "qdrant" && continue || echo ""
                if verificar_docker_e_portainer_traefik; then
                    ferramenta_qdrant
                fi
                ;;
            24)
                verificar_stack "woofedcrm" && continue || echo ""
                if verificar_docker_e_portainer_traefik; then
                    ferramenta_woofedcrm
                fi
                ;;
            26)
                verificar_stack "twentycrm" && continue || echo ""
                if verificar_docker_e_portainer_traefik; then
                    ferramenta_twentycrm
                fi
                ;;
            27)
                verificar_stack "mattermost" && continue || echo ""
                if verificar_docker_e_portainer_traefik; then
                    ferramenta_mattermost
                fi
                ;;
            28)
                verificar_stack "outline" && continue || echo ""
                if verificar_docker_e_portainer_traefik; then
                    ferramenta_outline
                fi
                ;;
            29)
                verificar_stack "focalboard" && continue || echo ""
                if verificar_docker_e_portainer_traefik; then
                    ferramenta_focalboard
                fi
                ;;
            30)
                verificar_stack "glpi" && continue || echo ""
                if verificar_docker_e_portainer_traefik; then
                    ferramenta_glpi
                fi
                ;;
            31)
                verificar_stack "flowise" && continue || echo ""
                if verificar_docker_e_portainer_traefik; then
                    ferramenta_flowise
                fi
                ;;
            32)
                verificar_stack "langflow" && continue || echo ""
                if verificar_docker_e_portainer_traefik; then
                    ferramenta_langflow
                fi
                ;;
            33)
                verificar_stack "ollama" && continue || echo ""
                if verificar_docker_e_portainer_traefik; then
                    ferramenta_ollama
                fi
                ;;
            34)
                verificar_stack "anythingllm" && continue || echo ""
                if verificar_docker_e_portainer_traefik; then
                    ferramenta_anythingllm
                fi
                ;;
            35)
                verificar_stack "nocodb" && continue || echo ""
                if verificar_docker_e_portainer_traefik; then
                    ferramenta_nocodb
                fi
                ;;
            36)
                verificar_stack "humhub" && continue || echo "" 
                if verificar_docker_e_portainer_traefik; then
                    ferramenta_humhub 
                fi
                ;;
            37)
                verificar_stack "wordpress" && continue || echo ""
                  if verificar_docker_e_portainer_traefik; then
                    ferramenta_wordpress
                  fi
                  ;;
            38)
                verificar_stack "formbricks" && continue || echo ""
                  if verificar_docker_e_portainer_traefik; then
                    ferramenta_formbricks
                  fi
                  ;;
            39)
                verificar_stack "metabase" && continue || echo ""
                  if verificar_docker_e_portainer_traefik; then
                    ferramenta_metabase
                  fi
                  ;;
            40)
                verificar_stack "docuseal" && continue || echo ""
                  if verificar_docker_e_portainer_traefik; then
                    ferramenta_docuseal
                  fi
                  ;;
            41)
                verificar_stack "monitor" && continue || echo ""
                  if verificar_docker_e_portainer_traefik; then
                    ferramenta_monitor
                  fi
                  ;;
            42)
                verificar_stack "dify" && continue || echo ""
                  if verificar_docker_e_portainer_traefik; then
                    ferramenta_dify
                  fi
                  ;;
            43)
                verificar_stack "affine" && continue || echo ""
                  if verificar_docker_e_portainer_traefik; then
                    ferramenta_affine
                  fi
                  ;;
            44)
                verificar_stack "vaultwarden" && continue || echo ""
                  if verificar_docker_e_portainer_traefik; then
                    ferramenta_vaultwarden
                  fi
                  ;;
            45)
                verificar_stack "nextcloud" && continue || echo ""
                  if verificar_docker_e_portainer_traefik; then
                    ferramenta_nextcloud
                  fi
                  ;;
            46)
                verificar_stack "strapi" && continue || echo ""
                  if verificar_docker_e_portainer_traefik; then
                    ferramenta_strapi
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
