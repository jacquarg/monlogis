[![Build Status](https://travis-ci.org/jacquarg/monlogis.png)](https://travis-ci.org/jacquarg/monlogis)

# Mon Logis une application MesInfos !

Open source, développée par la Fing, sous licence AGPL v3.

## Contribuer !
[Venez en discuter sur le forum MesInfos](https://mesinfos.fing.org/forum/d/71-mon-logis-pr-sentation-commentaires-volutions)

## En cours
* convertisseurs pour doctypes proches.

## TODO-list

### Bug
* Correction Bug : Calcul de la consommation erroné en cas de tarifs heures creuses

### Nouvelles fonctionnalités
* Gestion de _Plusieurs logis_

## Changelog

### V0.1.9
* fix bills ne chargent pas, selector mal formaté --> aucun chiffre dans l'UI.

### V0.1.8

* fix typo dans "comment ça marche" (thx [Pentux](https://mesinfos.fing.org/forum/d/86-application-mon-logis))
* "/Administration/Mon Logis" --> "/Administratif/Mon Logis" (thx [Pentux](https://mesinfos.fing.org/forum/d/85-rangement-des-dossiers))
* Ajout d'une icône (i) devant _Comment ça marche_ (thx [Pentux](https://mesinfos.fing.org/forum/d/87-application-mon-logis-pas-de-logo-mauvais-marquage))

### V0.1.7
* documentation, liste des fonctionnalités, et leur fonctionnement, à l'attention des utilisateurs.
* documentation des données utilisées (format attendus), données générées

### V0.1.6
#### Évolutions :
* Affichage de l'état du connecteur, dans la vue du fournisseur.

### V0.1.5
#### Évolutions :
* Écran mon logis
* Dispositif de recueil des traces d'usages (si activé par l'utilisateur, dans les paramètres de son cozy)

### V0.1.4
#### Corrections Bugs :
#### Évolutions :

### V0.1.4
#### Corrections Bugs :

* Calcul de la consommation erroné (non testé sur un tarif heures creuses.).

#### Évolutions :

* Calcul du budget télécoms sur 12 mois de factures.


## Howto hack this app

TODO !

You'll need a valid node.js/npm environment to develop the app. We use [Brunch](http://brunch.io/) as build tool. Before trying to develop the app, you need to load its dependencies:

```sh
npm i
```

#### Librairies

You should be aware of the app libraries in use:
* [Backbone](http://backbonejs.org/) is used for a quick and valid components architecture, like models
* [Marionette](http://marionettejs.com/) is the framework used upon Backbone to have a more clever and easier way to deal with views (like layouts, regions, and views switching)

#### Architecture
TODO
##### Files structure
TODO
##### App WorkFlow
TODO
