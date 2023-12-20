<template>
    <v-alert closable class="mx-auto w-25" v-model="successAlert" type="success" text="Operação realizada com sucesso"/>
    <v-alert closable class="mx-auto w-25" v-model="warningAlert" type="warning" text="Descartando alterações..."/>
    <v-alert closable class="mx-auto w-25" v-model="errorAlert"   type="error"   text="Erro ao salvar os dados"/>
    <div class="div1">
        <h1>Lista de Tarefas</h1>
        <v-row>
            <v-dialog v-model="dialog" fullscreen :scrim="false" transition="dialog-bottom-transition">
                <template v-slot:activator="{ props }">
                    <v-btn id="open" prepend-icon="mdi-plus" color="primary" dark v-bind="props" @click="reset()">Nova Tarefa</v-btn>
                </template>
                <v-card>
                    <v-toolbar dark color="#00608F">
                        <v-toolbar-title>Nova Tarefa</v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-toolbar-items>
                            <v-btn icon dark @click="this.close()">
                                <v-icon>mdi-close</v-icon>
                            </v-btn>
                        </v-toolbar-items>
                    </v-toolbar>
                    <v-card-text>
                        <v-container>
                            <v-row>
                                <v-col cols="12" sm="6" md="4">
                                    <v-text-field v-model="editingItem.titulo" variant="outlined" color="blue" label="* Título" required></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6" md="4">
                                    <v-combobox v-model="editingItem.prioridade" label="* Prioridade" required color="blue"
                                        :items="['Alta', 'Média', 'Baixa']"></v-combobox>
                                </v-col>
                                <v-col cols="12" sm="6" md="4">
                                    <v-text-field v-model="editingItem.descricao" variant="outlined" color="blue" label="* Descrição" required></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6" md="4">
                                    <v-radio-group v-model="editingItem.tipo">
                                        <v-radio label="Pessoal" value="Pessoal"></v-radio>
                                        <v-radio label="Trabalho" value="Trabalho"></v-radio>
                                        <v-radio label="Estudo" value="Estudo"></v-radio>
                                    </v-radio-group>
                                </v-col>
                                <v-col cols="12" sm="6" md="4">
                                    <v-checkbox v-model="editingItem.concluida" color="blue" label="Concluída"></v-checkbox>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" sm="6" md="4">
                                    <v-btn color="warning" @click="this.close()">Cancelar</v-btn>
                                    &nbsp;
                                    <v-btn color="success" @click="this.save()">Salvar</v-btn>
                                </v-col>
                            </v-row>
                        </v-container> 
                    </v-card-text>
                </v-card>
            </v-dialog>
        </v-row>

        <v-data-table :headers="headerList" :items="todolist" :items-per-page="3" item-key="descricao" class="elevation-1">
            <template v-slot:headers="{ items }">
                <tr>
                    <th v-for="header in headerList" :key="header.value" :value="header.value">{{ header.text }}</th>
                </tr>
            </template>
            <template v-slot:body="{ items }">
                <tr v-for="(item, index) in items" :key="item.descricao">
                    <td>{{ item.raw?item.raw['titulo']:item['titulo'] }}</td>
                    <td>{{ item.raw?item.raw['prioridade']:item['prioridade'] }}</td>
                    <td>{{ item.raw?item.raw['descricao']:item['descricao'] }}</td>
                    <td>{{ item.raw?item.raw['tipo']:item['tipo'] }}</td>
                    <td>{{ item.raw?(item.raw['concluida']?'S':'N'):(item['concluida']?'S':'N') }}</td>
                    <td style="max-width: 25mm;">
                        <v-btn class="actionButton" prepend-icon="mdi-pen" stacked @click="this.update(index)">
                            <v-tooltip activator="parent" location="left">Edit</v-tooltip>
                        </v-btn>
                        &nbsp;
                        <v-btn class="actionButton" prepend-icon="mdi-delete" stacked @click="this.delete(index)">
                            <v-tooltip activator="parent" location="right">Delete</v-tooltip>
                        </v-btn>
                        <!-- {{ JSON.stringify(item) }} -->
                    </td>
                </tr>
            </template>
            <template v-slot:no-data>
                <p>Não há dados a mostrar.</p>
            </template>
        </v-data-table>
        <v-dialog v-model="dialogDelete" width="auto">
            <v-card>
                <v-card-text>
                    Confirma a exclusão desse registro?
                </v-card-text>
                <v-card-actions>
                    <v-row>
                        <v-col cols="2" sm="6" md="4">
                            <v-btn color="primary" @click="dialogDelete = false">Fechar</v-btn>
                        </v-col>
                        <v-col cols="2" sm="6" md="4">
                            <v-btn color="red" @click="executeDelete()">Confirmar</v-btn>
                        </v-col>
                    </v-row>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<style scooped>
    .div1 {
        margin: 5mm 0 5mm 10mm;
    }
    #open {
        margin: 3mm 0 6mm 0;
    }
    h1 { 
        padding: 3mm 0 3mm 0;
    }
    table { 
        padding: 3mm 0 3mm 0;
    }
    thead {
        background-color: lightgrey;
    }
    tr > th {
        background-color: lightgrey !important;
    }
    th {
        color: black !important;
    }
    .actionButton {
        max-height: 7mm;
    }
</style>

<script lang="ts">
import { VDataTable } from 'vuetify/lib/components/VDataTable/VDataTable'

export default {
    data() {
        return {
            dialog: false,
            dialogDelete: false,
            notifications: false,
            sound: true,
            widgets: false,
            successAlert: false,
            warningAlert: false,
            errorAlert: false,
            function: 'insert',
            index: 0,
            editingItem: {
                titulo: '',
                prioridade: 'Média',
                descricao: '',
                tipo: 'Pessoal',
                concluida: false
            },
            todolist: [
                {
                    titulo: 'Mercado',
                    prioridade: 'Alta',
                    descricao: 'Pão',
                    tipo: 'Pessoal',
                    concluida: false
                },
                {
                    titulo: 'Mercado',
                    prioridade: 'Alta',
                    descricao: 'Leite',
                    tipo: 'Pessoal',
                    concluida: false
                },
                {
                    titulo: 'Mercado',
                    prioridade: 'Alta',
                    descricao: 'Café',
                    tipo: 'Pessoal',
                    concluida: false
                },
                {
                    titulo: 'Mercado',
                    prioridade: 'Média',
                    descricao: 'Ovos',
                    tipo: 'Pessoal',
                    concluida: false
                },
                {
                    titulo: 'Mercado',
                    prioridade: 'Baixa',
                    descricao: 'Detergente',
                    tipo: 'Pessoal',
                    concluida: false
                },
            ],
            headerList: [
                {
                    text: 'Título',
                    value: 'titulo'
                },
                {
                    text: 'Prioridade',
                    value: 'prioridade'
                },
                {
                    text: 'Descrição',
                    value: 'descricao'
                },
                {
                    text: 'Tipo',
                    value: 'tipo'
                },
                {
                    text: 'Concluída',
                    value: 'concluida'
                },
                {
                    text: 'Ações',
                    value: 'acoes'
                },
            ],
        }
    },
    methods: {
        close() {
            this.dialog = false
            this.function = 'insert'
            this.warningAlert = true
            setTimeout(() => { this.warningAlert = false }, 2000);
        },
        reset() {
            this.editingItem = {
                titulo: '',
                prioridade: 'Média',
                descricao: '',
                tipo: 'Pessoal',
                concluida: false
            }
        },
        save() {
            if (this.function == 'insert') {
                this.todolist.push(this.editingItem)
                localStorage.setItem('todolist', JSON.stringify(this.todolist));
                this.reset()
            } else {
                this.todolist[this.index] = this.editingItem
                localStorage.setItem('todolist', JSON.stringify(this.todolist));
                this.reset()
            }
            this.dialog = false
            this.function = 'insert'
            this.successAlert = true
            setTimeout(() => { this.successAlert = false }, 2000);
        },
        update(index) {
            this.index = index
            this.editingItem = this.todolist[index]
            this.function = 'update'
            this.dialog = true
        },
        delete(index) {
            this.index = index
            this.editingItem = this.todolist[index]
            this.dialogDelete = true
        },
        executeDelete() {
            this.dialogDelete = false
            this.todolist.splice(this.index, 1)
            localStorage.setItem('todolist', JSON.stringify(this.todolist));
            this.successAlert = true
            setTimeout(() => { this.successAlert = false }, 2000);
        }
    },
    components: {
        VDataTable,
    },
    mounted() {
        let list = localStorage.getItem('todolist')
        if (list?.length > 0) {
            this.todolist = JSON.parse(list)
        }
    },
}
</script>
