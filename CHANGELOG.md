# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.40](https://github.com/JMBeresford/retrom/compare/v0.7.39...v0.7.40) (2025-10-07)


### ⚠ BREAKING CHANGES

* **docker:** refer to the migration guide for details
* **docker:** The UID:GID of the retrom user in the container has changed from 1505:1505 to the more common 1000:1000. This is so it is less likely one needs to change the ID's at runtime. You may need to adjust or remove any `user: ` directives in your docker compose file.
* Certain configuration properties have been changed, as has the way configuration is handled in general. A best effort is made to migrate any configurations w/o needing manual intervention but you should consider **backing up your Retrom installation**.
* fullscreen mode is now available, but still experimental.
* Emulator profiles are now shared across clients. A best effort has been made to migrate existing profiles to the new shared system, but some manual intervention/clean up may be required.

### Features

* `install_dir` macro for custom args ([b78e4df](https://github.com/JMBeresford/retrom/commit/b78e4dfd11e2772eff4f5803cff1bfc19f9ae37f))
* allow deleted games to be re-imported ([d2e6ca3](https://github.com/JMBeresford/retrom/commit/d2e6ca31e7ea1b0686912796b70262e13a151c77))
* announcement system ([31f3ad3](https://github.com/JMBeresford/retrom/commit/31f3ad36389251bd224e879d6b182aedc7d073cf))
* better default emulator visibility ([a6d9e14](https://github.com/JMBeresford/retrom/commit/a6d9e14113dd46ea6bdca37da7231cdda04bdada))
* better in-game menu item labels ([71519c3](https://github.com/JMBeresford/retrom/commit/71519c3b2a27657090facdddbeadfb252a15e8c5))
* cache metadata images on server ([b856dd1](https://github.com/JMBeresford/retrom/commit/b856dd133af9263a02f7090424fa343cb04a007e)), closes [#366](https://github.com/JMBeresford/retrom/issues/366)
* change installation directory ([5da97e1](https://github.com/JMBeresford/retrom/commit/5da97e1505aea3f31bb5fff1cddfa84e58d3c780))
* clean library job ([4292ffb](https://github.com/JMBeresford/retrom/commit/4292ffbaec19b18f6d88f1e10497938a46639011)), closes [#214](https://github.com/JMBeresford/retrom/issues/214)
* client log file ([9072c88](https://github.com/JMBeresford/retrom/commit/9072c88f540a2731473f47a72841b794689adf30))
* **client:** add platform metadata edit dialog ([33812e5](https://github.com/JMBeresford/retrom/commit/33812e5a41b6d5954d9af2c0ad7afae6070df129))
* config panel ([141f637](https://github.com/JMBeresford/retrom/commit/141f63743da4d6b7c3613b5bed8b1c2fee3b23a5))
* Configure libraries from the client ([7c3273c](https://github.com/JMBeresford/retrom/commit/7c3273c25c731af6ba7b8b98be0235b719628b94))
* confirm on server disconnect ([8f3218a](https://github.com/JMBeresford/retrom/commit/8f3218a6f59b76a1c2a328b8e32d233836a8da81))
* connectivity indicator ([1912f33](https://github.com/JMBeresford/retrom/commit/1912f33d15bf3255001230a470a1fdef4bb5f908))
* Custom library structures ([549ef6e](https://github.com/JMBeresford/retrom/commit/549ef6e9ab1e078c4595a794715edf25febbd57e)), closes [#104](https://github.com/JMBeresford/retrom/issues/104)
* default profiles for newly added emulators ([67504b9](https://github.com/JMBeresford/retrom/commit/67504b9edb6eea099a05db1b6b47cdf83259edf1))
* delete platform entries ([3f31a07](https://github.com/JMBeresford/retrom/commit/3f31a076e98b36f5e18401c47a4ee1677c75a38d)), closes [#101](https://github.com/JMBeresford/retrom/issues/101)
* **docker:** Redirect root path to `/web` ([60037d0](https://github.com/JMBeresford/retrom/commit/60037d0717fc6b2d73aef1617beab505d84a5fe9))
* **docker:** runtime env/perms management ([52c0caf](https://github.com/JMBeresford/retrom/commit/52c0caf80935d363a3012fbb7506e2c69e46d6f8))
* download game from drop-down ([555d5bd](https://github.com/JMBeresford/retrom/commit/555d5bdd3860a9f62500b1409a18bb414c64f9ba)), closes [#377](https://github.com/JMBeresford/retrom/issues/377)
* Fullscreen game list names ([f048da4](https://github.com/JMBeresford/retrom/commit/f048da4c2b7691a550e1b29b8781811b68a70e43))
* fullscreen game page overhaul ([e4441d1](https://github.com/JMBeresford/retrom/commit/e4441d10f71625f8c606924043f7ed29802d5791))
* fullscreen mode ([#173](https://github.com/JMBeresford/retrom/issues/173)) ([f1e4a9d](https://github.com/JMBeresford/retrom/commit/f1e4a9deb8e907d7a2232f200233f472acb848e7))
* Ignore Patterns ([2eeabc3](https://github.com/JMBeresford/retrom/commit/2eeabc343c96eeefcd1a58fd1b202c4c80549ea0)), closes [#123](https://github.com/JMBeresford/retrom/issues/123)
* improved server connect experience ([f942331](https://github.com/JMBeresford/retrom/commit/f942331d2648e2b472a2521b5f372510da458ff4)), closes [#313](https://github.com/JMBeresford/retrom/issues/313)
* include screenshots in metadata ([a7b78c5](https://github.com/JMBeresford/retrom/commit/a7b78c52c99dd429d44dbfd5460858ee6d31a885))
* indicate installation status in side bar ([bae14bd](https://github.com/JMBeresford/retrom/commit/bae14bd783100228c66b895bc64c73b1a2ec128d))
* init application performance metrics ([#307](https://github.com/JMBeresford/retrom/issues/307)) ([e5e2a1c](https://github.com/JMBeresford/retrom/commit/e5e2a1cddbd53ea05c1bfa540598c87ee0ed8769))
* initial emulatorJS and cloud save support ([5ee1346](https://github.com/JMBeresford/retrom/commit/5ee1346587359a2d44226ac64930ed4fd88d30f2))
* initial gamepad support ([59df10f](https://github.com/JMBeresford/retrom/commit/59df10f646830e03066f2bd77339fe731761df1c))
* initial switch gamepad mapping ([5a0adb0](https://github.com/JMBeresford/retrom/commit/5a0adb0cf1c820cf262a128ac77db513b2b6bab2)), closes [#330](https://github.com/JMBeresford/retrom/issues/330)
* installation manager ([#406](https://github.com/JMBeresford/retrom/issues/406)) ([43b5114](https://github.com/JMBeresford/retrom/commit/43b5114bd2c00d2ead5879f67ad14acae2d2ad02))
* Mobile responsive UI ([#298](https://github.com/JMBeresford/retrom/issues/298)) ([5f9beb6](https://github.com/JMBeresford/retrom/commit/5f9beb649de7c9f2922dfe45f8f0a2444f7f84f2))
* notification UI tweaks ([#401](https://github.com/JMBeresford/retrom/issues/401)) ([fdeb6e8](https://github.com/JMBeresford/retrom/commit/fdeb6e8c7ea00cd6d02bcecf508e0c594f132041))
* open installation directories from client ([044d4df](https://github.com/JMBeresford/retrom/commit/044d4df82b1ca6c8dc03d650df327faa105edd4e))
* opt-in installation of games in standalone mode ([074b882](https://github.com/JMBeresford/retrom/commit/074b882623b114ce6893e9dc64276ae7ebb3bee4))
* opt-in overwriting in download metadata job ([e8c7b15](https://github.com/JMBeresford/retrom/commit/e8c7b157bc91d4982d220a74a651aa3348e6988d))
* persist window size and position ([e2a0dfa](https://github.com/JMBeresford/retrom/commit/e2a0dfa0da8d99dabebe6de19587ffd10ff7ebe6)), closes [#145](https://github.com/JMBeresford/retrom/issues/145)
* prioritize exact matches in IGDB search by default ([12bd960](https://github.com/JMBeresford/retrom/commit/12bd960753647c2f491d4f201efe2da3c6d93cc3)), closes [#168](https://github.com/JMBeresford/retrom/issues/168)
* scanned games are matched by platform ([2161a42](https://github.com/JMBeresford/retrom/commit/2161a42e8a8cf8c1a67274785fa4c982f134e55b))
* scroll by character in fullscreen mode ([f882f5b](https://github.com/JMBeresford/retrom/commit/f882f5bf52abee43667a9c856beca85bb0dcacdf))
* serve web client directly from service ([#356](https://github.com/JMBeresford/retrom/issues/356)) ([ca07b6d](https://github.com/JMBeresford/retrom/commit/ca07b6d4c7c3f3e0e6128b86827f84377d5b8a79))
* shared emulator profiles ([4b13eab](https://github.com/JMBeresford/retrom/commit/4b13eab862ecf7cf75ee41c3aca56b429b56d9b8))
* sort by time played + sort fixes ([e36ff6f](https://github.com/JMBeresford/retrom/commit/e36ff6f5fc2265db2d3355cea5efe1df8ba142dc))
* Standalone mode ([f297e76](https://github.com/JMBeresford/retrom/commit/f297e76fe80e87768e83684af991bdf1f73fcbe0))
* standalone support ([9a54ffc](https://github.com/JMBeresford/retrom/commit/9a54ffc57212939bae0ffa4d6c01c06c91dbec48))
* steam integration ([d32347c](https://github.com/JMBeresford/retrom/commit/d32347cc91a0a29d74905c0aaa6b8a2eae1b47c6))
* UI tweaks ([cc4b546](https://github.com/JMBeresford/retrom/commit/cc4b546ae0a4a0ed7023164617296c6c037e7433))
* UI tweaks ([6eed554](https://github.com/JMBeresford/retrom/commit/6eed5542061b4ffbe8ce6c043a9a84af42a870ef))
* UI tweaks ([6912e90](https://github.com/JMBeresford/retrom/commit/6912e9052c314f2edbe256e9c9d9965020e79141))
* version modals added to menubar ([79bbbb7](https://github.com/JMBeresford/retrom/commit/79bbbb74b21b672c1812827ea3a5bb6880177d9f))


### Bug Fixes

* 'play with' drop down shows all valid emulators ([13017ad](https://github.com/JMBeresford/retrom/commit/13017ad320630a6c1a03e27ff4627e35fa05afb4))
* allow for ulimit to increase open file limit ([3faa580](https://github.com/JMBeresford/retrom/commit/3faa580feb6caaa88eb93e6edcba3197e2895b38))
* auto-updater ([873b4a1](https://github.com/JMBeresford/retrom/commit/873b4a1e76c6dad174b634643d42b6796367db10))
* auto-updating ([f7d18d6](https://github.com/JMBeresford/retrom/commit/f7d18d6cde7d6928bdda5ecc211ebfe9c82d780e))
* better handle certain networking configs ([9190398](https://github.com/JMBeresford/retrom/commit/91903985d04a1f6baf5dbdc6f8546a90ee8ab384))
* Cannot read 'invoke' errors ([5e5181f](https://github.com/JMBeresford/retrom/commit/5e5181f2cf10223e023702bc09dd0bb5c99dc2ea))
* changelog rendering ([83f95c6](https://github.com/JMBeresford/retrom/commit/83f95c6768b68af57fe7095603cc852cf1a13d96))
* changing of install directory ([c805549](https://github.com/JMBeresford/retrom/commit/c805549906286dc54cbd5f32e87159afde36eb1d))
* **ci:** extend release-please ([b83cf41](https://github.com/JMBeresford/retrom/commit/b83cf41a412ec0a48639901b85d7e6e3cec0537c))
* **client:** indent changelog bodies ([7141d86](https://github.com/JMBeresford/retrom/commit/7141d86503b57e13b248439a44ceabf92b88318b))
* **client:** render new version number correctly ([e0ebd47](https://github.com/JMBeresford/retrom/commit/e0ebd477e13530f563fb6160b14c6c1516c6006e))
* config and embedded db fixes ([50a556e](https://github.com/JMBeresford/retrom/commit/50a556e3fac4135625704cea39bbc4a7b7a4829c))
* confirmation dialogs ([4c1f674](https://github.com/JMBeresford/retrom/commit/4c1f67460ad9594cf211202e0ad9d43192468161))
* content directory management ([ea09ec5](https://github.com/JMBeresford/retrom/commit/ea09ec5ccd4d396898e617a9d957f65d5590b2e6)), closes [#324](https://github.com/JMBeresford/retrom/issues/324)
* controller binding menu tweaks ([9110c60](https://github.com/JMBeresford/retrom/commit/9110c60637d670f4bfb813c67d14e59144551199))
* controller binding menu tweaks ([2195da3](https://github.com/JMBeresford/retrom/commit/2195da3aa2f5adad6f95c5531f2f9e0bf911b27f))
* create config directory if needed ([5919480](https://github.com/JMBeresford/retrom/commit/59194806ecbf5a6023456572fe6fa71aa7ca3bbb))
* creating log file ([fa6f91b](https://github.com/JMBeresford/retrom/commit/fa6f91b6349ef5b788bea6d6bed6d0be1de4a4de))
* default menu button binding ([5e0e96e](https://github.com/JMBeresford/retrom/commit/5e0e96e15e7c56cdd21c2739b47d66dfb97ff0e6))
* default profiles modal UI tweaks ([678815b](https://github.com/JMBeresford/retrom/commit/678815bc17d45b23eb51e27ef8d643766a4e5d93))
* default to filename in IGDB search ([4e257e3](https://github.com/JMBeresford/retrom/commit/4e257e3a88878c5db696149417316a5cf9d2c7c0)), closes [#231](https://github.com/JMBeresford/retrom/issues/231)
* disclaimer no longer re-renders ([84438bf](https://github.com/JMBeresford/retrom/commit/84438bf5b7678bfda38f61b8c673fc764c10873a))
* display empty platform entries ([ed9fd39](https://github.com/JMBeresford/retrom/commit/ed9fd394ac7bfda2066eda4d63c21a6240fd0f66))
* **docker:** better default permissions ([ac33d47](https://github.com/JMBeresford/retrom/commit/ac33d47907fb2dfa7d1483f55b7cb8cd23b2da11))
* **docker:** better permissions defaults and handling ([5433f0c](https://github.com/JMBeresford/retrom/commit/5433f0c9e0dd728cd105852251c8a36e31790277))
* **docker:** corepack keyid error ([e3b3c8c](https://github.com/JMBeresford/retrom/commit/e3b3c8c8f1539829708d35d4e15a410c87f71e99)), closes [#250](https://github.com/JMBeresford/retrom/issues/250)
* **docker:** create DB dir ([8e833ad](https://github.com/JMBeresford/retrom/commit/8e833adb8826353072dcb21d648574af696c570c))
* **Docker:** graceful shutdown of server and DB ([a6f02d9](https://github.com/JMBeresford/retrom/commit/a6f02d9218747167bd3982a5f3915f0d9f293f1f)), closes [#396](https://github.com/JMBeresford/retrom/issues/396)
* **docker:** npm permission issues ([cd51f9a](https://github.com/JMBeresford/retrom/commit/cd51f9a17eb5bb491afd193203833ffc24a3306a))
* **docker:** npm permission issues ([4359bff](https://github.com/JMBeresford/retrom/commit/4359bff30ac0caa2e8f0f786c02566e9a79c7f62))
* **docker:** root-less docker container ([9464a23](https://github.com/JMBeresford/retrom/commit/9464a23be442fb235d88d44f2c6a50639c5f43d8))
* don't crash when steam not installed ([1c1e3f5](https://github.com/JMBeresford/retrom/commit/1c1e3f51418d9d9769130b47a4a3afac0a8b712d))
* don't launch directories as fallback ([31c5df0](https://github.com/JMBeresford/retrom/commit/31c5df049c9e30d8fd0a47886269c07e449447a6))
* don't resize window on web ([c1ef145](https://github.com/JMBeresford/retrom/commit/c1ef145f80031714222c3b12c2ca255a13c94bfa))
* don't show empty platforms in fullscreen mode ([4e72687](https://github.com/JMBeresford/retrom/commit/4e72687e0ea5424d48c2bd2cb83e87dc68a53276)), closes [#182](https://github.com/JMBeresford/retrom/issues/182)
* dont crash on missing steam library ([1ab7409](https://github.com/JMBeresford/retrom/commit/1ab7409f76a2fd8f12e3c566b74fc5ec425343ad)), closes [#208](https://github.com/JMBeresford/retrom/issues/208)
* download game button ([a9c8abc](https://github.com/JMBeresford/retrom/commit/a9c8abc127d095df748549e538406e405fea5fc3)), closes [#377](https://github.com/JMBeresford/retrom/issues/377)
* EGL Bad Parameter error on some devices ([14316a1](https://github.com/JMBeresford/retrom/commit/14316a1905ff2bd832f752403a180fce5051f077))
* embedded DB ([dd99083](https://github.com/JMBeresford/retrom/commit/dd9908324c1c492f505876cd74f76cf79acda9a1))
* embedded DB failing to start ([dc90508](https://github.com/JMBeresford/retrom/commit/dc90508e310a2fb9d527127b301cd47aff71b679)), closes [#391](https://github.com/JMBeresford/retrom/issues/391)
* empty links section ([a2095d1](https://github.com/JMBeresford/retrom/commit/a2095d1f09ebce3d797ed6b4caf33c2b44a96532)), closes [#346](https://github.com/JMBeresford/retrom/issues/346)
* emulator save strategy dropdown ([e03dc3a](https://github.com/JMBeresford/retrom/commit/e03dc3a6c7335fb2f3fa8a300f23880b24905ace))
* fetch default profile for new emulators ([a2bdbcc](https://github.com/JMBeresford/retrom/commit/a2bdbcc15584c9208442c7d32955abc145c43536)), closes [#286](https://github.com/JMBeresford/retrom/issues/286)
* file dialogs on game details page ([#407](https://github.com/JMBeresford/retrom/issues/407)) ([808a69e](https://github.com/JMBeresford/retrom/commit/808a69e56b4d0683e12ecad9d07a442e4b7a6c46)), closes [#347](https://github.com/JMBeresford/retrom/issues/347)
* **file-explorer:** allow navigating to root ([1370c61](https://github.com/JMBeresford/retrom/commit/1370c6173b0c875c12a568d9ce6545d6a15d5276))
* Full screen mode no longer crashing ([de4adfa](https://github.com/JMBeresford/retrom/commit/de4adfa3fcd44b768ec1528eb4b80ea70906db26))
* Fullscreen action button ([7c33562](https://github.com/JMBeresford/retrom/commit/7c335626915d4c5bacc0c5668fa2854e03425a92))
* fullscreen mode on AppImage installations ([#297](https://github.com/JMBeresford/retrom/issues/297)) ([a7c7aa3](https://github.com/JMBeresford/retrom/commit/a7c7aa3e3483f7762bb488047378ca52bc5bcf25))
* **fullscreen:** Installation progress ([c4a95f5](https://github.com/JMBeresford/retrom/commit/c4a95f53fd44e8f00d121fc029e945ae26ca494a))
* handle filenames starting with a dot in getFileParts function ([5a4e3ae](https://github.com/JMBeresford/retrom/commit/5a4e3ae2ecebd495b4e03199ddef1ddd2664be0a)), closes [#389](https://github.com/JMBeresford/retrom/issues/389)
* hide empty third party libraries ([ab1fe80](https://github.com/JMBeresford/retrom/commit/ab1fe804369715a657992aef3a92749d729455de))
* home screen scrolling to bottom ([373a754](https://github.com/JMBeresford/retrom/commit/373a7548b795845eef4599ee8a9bdf475025b1af))
* hotkey navigation of menus ([ef0625d](https://github.com/JMBeresford/retrom/commit/ef0625db0f10279385f1f5bf34b3e684f12261f4))
* ignore missing steam dir ([61cf359](https://github.com/JMBeresford/retrom/commit/61cf3597a8a80d68e47de0115ecc3319a5e56c62))
* in-game overlay menu open button now works ([3faf98b](https://github.com/JMBeresford/retrom/commit/3faf98b8ea283d338818a9ec776b1608afef2338))
* installed games filenames ([4214046](https://github.com/JMBeresford/retrom/commit/4214046cf32af958f2cf629ffdc2f37347a57935))
* IPC communications ([1b2a1ea](https://github.com/JMBeresford/retrom/commit/1b2a1ea1f34f66a94ddbb66779a737223036012d))
* large library jobs no longer block client ([0ec77ad](https://github.com/JMBeresford/retrom/commit/0ec77ad2fff690cb39804454e44d343a4cf3d69a))
* **launcher:** default file handling ([f5b0c89](https://github.com/JMBeresford/retrom/commit/f5b0c89f5d2059d4b2c9784a53e0d17586fc132b))
* link rendering in changelog ([359f26c](https://github.com/JMBeresford/retrom/commit/359f26c4ffa219a10fba31ba619405019f793fab))
* macOS builds ([1ac0a92](https://github.com/JMBeresford/retrom/commit/1ac0a92a86ae66cfc7eab5d44a92a53c8acf7f8a))
* make steam config optional ([ab0b644](https://github.com/JMBeresford/retrom/commit/ab0b6449715beb9dbf8b225467c8a9f4157b79fb)), closes [#205](https://github.com/JMBeresford/retrom/issues/205)
* manual metadata edit ([3ebc191](https://github.com/JMBeresford/retrom/commit/3ebc19114278b777118a64079dc888e6d6812464)), closes [#230](https://github.com/JMBeresford/retrom/issues/230)
* mapping gamepad sticks ([686bc03](https://github.com/JMBeresford/retrom/commit/686bc03b3193a5278b61d736b6ee98658f7b0860)), closes [#338](https://github.com/JMBeresford/retrom/issues/338)
* memory usage in extra metadata job ([25f5cc7](https://github.com/JMBeresford/retrom/commit/25f5cc73262ef82d44cf2f9fb0c2a31d338fc1a4))
* menubar spacing ([3fe66c6](https://github.com/JMBeresford/retrom/commit/3fe66c66b7482a8691bb6bd0466ae68437879931))
* MultiFileGame installations ([4df17da](https://github.com/JMBeresford/retrom/commit/4df17dac6a7e9baddbb466ced53e3fe6559f45da))
* open installation directory menu item ([5c553d3](https://github.com/JMBeresford/retrom/commit/5c553d39bcc17cc5814e35a331131270ed387a1a))
* per-client default emulator profiles ([d4f6c87](https://github.com/JMBeresford/retrom/commit/d4f6c87ee4424a1af15102fd9108afacb47f1b7a))
* persist web client config ([b44a538](https://github.com/JMBeresford/retrom/commit/b44a538ec02132a2cce66fafd70add7539054eba))
* prioritize existing match in metadata update ([2e62b5e](https://github.com/JMBeresford/retrom/commit/2e62b5e8edb5b3037c7a1e4948a0eefb9ba0b193))
* progress bar animations ([767d6d3](https://github.com/JMBeresford/retrom/commit/767d6d3f0c9a1607175767882c90533788e064cf))
* relative path ignore patterns ([d1333c9](https://github.com/JMBeresford/retrom/commit/d1333c93b6e5a8400f6086c888e897595b35996e))
* semantics of manual metadata update modal ([ee9d839](https://github.com/JMBeresford/retrom/commit/ee9d839fef953ac24f8379587ee1417d7a4c97da)), closes [#142](https://github.com/JMBeresford/retrom/issues/142)
* server config tab not saving ([564ae01](https://github.com/JMBeresford/retrom/commit/564ae012cd35f6ef999e9126a775eeec0239a650)), closes [#326](https://github.com/JMBeresford/retrom/issues/326)
* service logs ([6f6e909](https://github.com/JMBeresford/retrom/commit/6f6e909d4c34e111d800f8d1a0dd36d900a38bc3))
* **service:** better error logs ([c32498f](https://github.com/JMBeresford/retrom/commit/c32498fcd34ea1acf422a535108f4ff5010917b1))
* sort fullscreen games alphabetically ([6fa1bad](https://github.com/JMBeresford/retrom/commit/6fa1bad94e659bf3042cdb6d150dca4f08f38e3b))
* standalone toggle no longer hangs ([5deaae8](https://github.com/JMBeresford/retrom/commit/5deaae85039297ddd9f730cc54ace93f8139311c))
* steam installation status in standalone mode ([894772e](https://github.com/JMBeresford/retrom/commit/894772e90e1793bc51841ba8ade518a2e607d7d4))
* steam playtime now updated in metadata jobs ([9390c3f](https://github.com/JMBeresford/retrom/commit/9390c3f45ee819cb06ca85c8611caa82aaad4a67))
* stop overwriting OS of builtin emulators ([5ce7529](https://github.com/JMBeresford/retrom/commit/5ce75291b1cd2cd8c63230d357702977acf2efbe))
* sub-directories in game files ([1eb2318](https://github.com/JMBeresford/retrom/commit/1eb23188547f529682e41d213ffa53c45da45c0c))
* support running service docker image as user ([fdb5a68](https://github.com/JMBeresford/retrom/commit/fdb5a686bac3008b0622587f72186e3259b008e1))
* test release ([1842345](https://github.com/JMBeresford/retrom/commit/184234557b727cf0f060b50776584227d5bfaa47))
* UI tweaks ([6f96546](https://github.com/JMBeresford/retrom/commit/6f96546d8c3a073abf1da14e47c2b75e86e86f07))
* UI tweaks ([99bd5f2](https://github.com/JMBeresford/retrom/commit/99bd5f2e94ed8f6f5ea75e9d75bb99fbc2851384))
* UI Tweaks ([643500c](https://github.com/JMBeresford/retrom/commit/643500c706a4b91e8715fba202fceb7842f367c6))
* UI Tweaks ([5bbbc16](https://github.com/JMBeresford/retrom/commit/5bbbc1640f39127b7f8bbcfdd42138c7233bc39e))
* UI Tweaks ([71bb720](https://github.com/JMBeresford/retrom/commit/71bb720f763ded16907bdeac285919995e885b09))
* ulimit permission errors preventing container startup ([#404](https://github.com/JMBeresford/retrom/issues/404)) ([72d4f88](https://github.com/JMBeresford/retrom/commit/72d4f8858b97ddc68ec3143822a2d64223ace60b))
* update getFileParts to handle additional cases ([4a193f7](https://github.com/JMBeresford/retrom/commit/4a193f7d6d09b4f19cedbedac24cc226ba307cb4))
* various launcher behaviors ([3913dd6](https://github.com/JMBeresford/retrom/commit/3913dd603be008cd2609af14740ea967399ddfc7))
* web client ([4bec1fe](https://github.com/JMBeresford/retrom/commit/4bec1fe413fb26ee034c6ca2de050c5362ae8aba))
* **web client:** download button ([b75f4bc](https://github.com/JMBeresford/retrom/commit/b75f4bcfdca6f11a293916a1db7ca45b364a9ad1))
* **Web Client:** Fix downloading games w/ commas in name ([1767446](https://github.com/JMBeresford/retrom/commit/1767446eef7cc23ebb2c60ee1d765f3c089cc118))
* **web client:** use service port defined in config file ([55c9c83](https://github.com/JMBeresford/retrom/commit/55c9c83b9c3f6cff097f5f018c5aa6691808917f))
* web UI not loading ([3f5e6e2](https://github.com/JMBeresford/retrom/commit/3f5e6e202219c272a68e73eeba5da855f708aa6d))

## [Unreleased]
## [0.7.39](https://github.com/JMBeresford/retrom/compare/v0.7.38...v0.7.39) - 2025-09-30

### Newly Added
- installation manager ([#406](https://github.com/JMBeresford/retrom/pull/406))

    Game installations are now shown in the new installation dashboard,
    in addition other relevant locations like the library side bar etc. The dashboard
    allows you to view the status of and manage installs in the following ways:

    - Cancel installations
    - Immediately install a queued installation, pausing the currently active one
    - See installation speed and progress at a glance for all installations
    - See recently installed games

    **Screenshots**

    ![Screenshot 1](https://github.com/user-attachments/assets/5b360d3c-be83-4136-924f-10c8b26b020e)

    ![Screenshot 2](https://github.com/user-attachments/assets/952d2f32-4c30-489d-8975-763ed884ab79)


## [0.7.38](https://github.com/JMBeresford/retrom/compare/v0.7.37...v0.7.38) - 2025-09-20

### Bug Fixes
- file dialogs on game details page ([#407](https://github.com/JMBeresford/retrom/pull/407))

    The rename and delete file modal dialogs now work
    as expected.

    fixes [#347](https://github.com/JMBeresford/retrom/pull/347)




## [0.7.37](https://github.com/JMBeresford/retrom/compare/v0.7.36...v0.7.37) - 2025-09-12

### Bug Fixes
- standalone toggle no longer hangs



### Newly Added
- notification UI tweaks ([#401](https://github.com/JMBeresford/retrom/pull/401))


## [0.7.36](https://github.com/JMBeresford/retrom/compare/v0.7.35...v0.7.36) - 2025-09-05

### Bug Fixes
- *(Docker)* graceful shutdown of server and DB

    fixes [#396](https://github.com/JMBeresford/retrom/pull/396)




## [0.7.35](https://github.com/JMBeresford/retrom/compare/v0.7.34...v0.7.35) - 2025-08-31

### Bug Fixes
- embedded DB failing to start

    More cases in which the embedded DB server failed
    to start have been addressed. Specifically, if the
    server is not gracefully shutdown Retrom will now
    attempt to clean up the environment when it is next
    brought back up which should address many of these
    failures.

    fixes [#391](https://github.com/JMBeresford/retrom/pull/391)





### Newly Added
- *(docker)* Redirect root path to `/web`

    When navigating to your Retrom server in the browser,
    the root path (e.g. `localhost:5101/` or `retrom.my-website.com/`)
    will now redirect to the web client at `/web` (e.g. `localhost:5101/web`
    or `retrom.my-website.com/web`).




## [0.7.34](https://github.com/JMBeresford/retrom/compare/v0.7.33...v0.7.34) - 2025-08-31

### Bug Fixes
- Full screen mode no longer crashing

    Full screen mode was crashing when game entries had
    names that started with a period. This is now fixed.



- embedded DB

    The optional embedded DB was occasionally non-functional in the docker image, this should no longer be the case.




## [0.7.33](https://github.com/JMBeresford/retrom/compare/v0.7.32...v0.7.33) - 2025-08-24

### Newly Added
- cache metadata images on server

    Retrom now caches all remote image files on
    the server, and the client will fetch those
    copies instead of accessing the external URLs
    they were sourced from.

    If a file is not currently cached, the client
    will still use the upstream URL -- but the file
    will be cached for next time.

    fixes [#366](https://github.com/JMBeresford/retrom/pull/366)




## [0.7.32](https://github.com/JMBeresford/retrom/compare/v0.7.31...v0.7.32) - 2025-08-10

### Bug Fixes
- download game button

    The download game button now uses the correct
    download URL.

    fixes [#377](https://github.com/JMBeresford/retrom/pull/377)





### Newly Added
- download game from drop-down

    There is now a drop-down option to download
    a game on its details page.

    fixes [#377](https://github.com/JMBeresford/retrom/pull/377)




## [0.7.31](https://github.com/JMBeresford/retrom/compare/v0.7.30...v0.7.31) - 2025-08-03

### Newly Added
- improved server connect experience

    The server connection dialog will now tell you if you are attempting to
    use a malformed URL (e.g. not including "http://"), hopefully reducing confusion when
    connections fail.

    resolves [#313](https://github.com/JMBeresford/retrom/pull/313)




## [0.7.30](https://github.com/JMBeresford/retrom/compare/v0.7.29...v0.7.30) - 2025-07-27

### Newly Added
- serve web client directly from service ([#356](https://github.com/JMBeresford/retrom/pull/356))

    The web client is now served directly by the main Retrom service. This means that the web client can now be accessed under the same port that the service listens on. This also sets the Retrom service up for distribution methods other than docker. Keep your eyes open for native binaries for Windows / MacOS / Linux in the future!




## [0.7.29](https://github.com/JMBeresford/retrom/compare/v0.7.28...v0.7.29) - 2025-07-14

### Bug Fixes
- mapping gamepad sticks

    Gamepad sticks are now mappable in web-based emulation

    resolves [#338](https://github.com/JMBeresford/retrom/pull/338)



- stop overwriting OS of builtin emulators


## [0.7.28](https://github.com/JMBeresford/retrom/compare/v0.7.27...v0.7.28) - 2025-06-30

### Newly Added
- opt-in installation of games in standalone mode

    You can now configure standalone mode to require 'installing'
    games as if they were hosted on a dedicated Retrom server. This
    is useful in cases where you are running standalone mode but accessing
    a library from a network drive. Installing in such cases ensures you
    have a truly local copy of your installed games.

    This also fixes a bug where in some cases standalone mode was
    unconditionally requiring installation of games.




## [0.7.27](https://github.com/JMBeresford/retrom/compare/v0.7.26...v0.7.27) - 2025-06-23

### Newly Added
- initial switch gamepad mapping

    Initial support for the following switch gamepads
    and their respective default mappings have been added:

    Switch Pro Controller, Switch JoyCons, Switch N64 Controller

    resolves [#330](https://github.com/JMBeresford/retrom/pull/330)




## [0.7.26](https://github.com/JMBeresford/retrom/compare/v0.7.25...v0.7.26) - 2025-06-22

### Bug Fixes
- default menu button binding

    The default gamepad button for opening Retrom menus
    is now mapped to the home (xbox/playstation) button rather
    than what is usually considered the start button. This
    removes the collision w/ in-game usage of the start button
    in-game.

    partially resolves [#330](https://github.com/JMBeresford/retrom/pull/330)





### Newly Added
- init application performance metrics ([#307](https://github.com/JMBeresford/retrom/pull/307))

    Retrom now has optional, **opt-in** anonymous telemetry
    to help with identifying and improving performance
    issues in both the server and the client. Nothing is sent by
    default, you must explicitly enable this collection -- if you
    would like to help Retrom improve then please consider enabling
    this feature!




## [0.7.25](https://github.com/JMBeresford/retrom/compare/v0.7.24...v0.7.25) - 2025-06-17

### Bug Fixes
- steam playtime now updated in metadata jobs

- server config tab not saving

    fixes [#326](https://github.com/JMBeresford/retrom/pull/326)



- content directory management

    fixes [#324](https://github.com/JMBeresford/retrom/pull/324)




## [0.7.24](https://github.com/JMBeresford/retrom/compare/v0.7.23...v0.7.24) - 2025-06-15

### Bug Fixes
- auto-updater

    There were certain cases in which the auto-updater was failing to find
    new updates, this has been resolved.

    Additionally, macOS releases are now able to leverage the auto-updater
    -- no longer requiring macOS clients to be manually updated via
    downloading the new release.




## [0.7.23](https://github.com/JMBeresford/retrom/compare/v0.7.22...v0.7.23) - 2025-06-15

### Bug Fixes
- 'play with' drop down shows all valid emulators

- in-game overlay menu open button now works

- disclaimer no longer re-renders


## [0.7.22](https://github.com/JMBeresford/retrom/compare/v0.7.21...v0.7.22) - 2025-06-15

### Newly Added
- initial emulatorJS and cloud save support

    It's happening! Built-in, browser-based emulation is now possible in Retrom via EmulatorJS. Configure the newly added built-in emulators to support the platforms in your library and simply click the play button!

    The following features are coming with this initial release:

    1. In-browser emulation (of course!)
    2. Managed, cloud save files for supported emulators/cores
    3. Managed, cloud save states for supported emulators/cores
    4. Configurable, automated backups of both cloud save files and save states
    5. In-game overlay, for easy configuration of the emulation experience and control schemes (gamepads too!)
    6. Import/export your save files and save states straight from the in-game overlay

    EmulatorJS-based emulation is still considered experimental, so you may encounter bugs -- please file an issue on GitHub or reach out via Discord if you have any issues or questions!




## [0.7.21](https://github.com/JMBeresford/retrom/compare/v0.7.20...v0.7.21) - 2025-05-03

### Bug Fixes
- sort fullscreen games alphabetically

- fetch default profile for new emulators

    When a new emulator is created, its default profile
    will now be present in the profile list immediately.

    fixes [#286](https://github.com/JMBeresford/retrom/pull/286)





### Newly Added
- scroll by character in fullscreen mode

    You can now use the list of characters on the left
    of alphabetically sorted game lists in fullscreen mode
    to scroll to games starting with that character. This is
    useful for large libraries that are hard to navigate in
    fullscreen mode.




## [0.7.20](https://github.com/JMBeresford/retrom/compare/v0.7.19...v0.7.20) - 2025-04-28

### Bug Fixes
- menubar spacing


## [0.7.19](https://github.com/JMBeresford/retrom/compare/v0.7.18...v0.7.19) - 2025-04-28

### Bug Fixes
- fullscreen mode on AppImage installations ([#297](https://github.com/JMBeresford/retrom/pull/297))

    Using the Retrom AppImage on linux should no longer lead to crashes in fullscreen mode





### Newly Added
- Mobile responsive UI ([#298](https://github.com/JMBeresford/retrom/pull/298))

    Retrom's web client is now mobile responsive!




## [0.7.18](https://github.com/JMBeresford/retrom/compare/v0.7.17...v0.7.18) - 2025-04-07

### Bug Fixes
- changing of install directory

    No longer fails due to installed Steam games
    not being in Retrom's installation directory
    (because why would they be?)



- Cannot read 'invoke' errors


## [0.7.17](https://github.com/JMBeresford/retrom/compare/v0.7.16...v0.7.17) - 2025-04-04

### Bug Fixes
- web client

    The web client was occasionally failing to build after recent changes to the docker image. This should no longer happen.



- don't crash when steam not installed


## [0.7.16](https://github.com/JMBeresford/retrom/compare/v0.7.15...v0.7.16) - 2025-04-03

### Bug Fixes
- macOS builds


## [0.7.15](https://github.com/JMBeresford/retrom/compare/retrom-v0.7.14...retrom-v0.7.15) - 2025-04-02

### Bug Fixes
- steam installation status in standalone mode

    When using Retrom in standalone mode, your
    library will no longer show every Steam game as
    installed even when they are not.



- *(fullscreen)* Installation progress

    The Install button now correctly reports the installation
    progress in fullscreen mode again.





### Newly Added
- *(client)* add platform metadata edit dialog

- confirm on server disconnect


## [0.7.14](https://github.com/JMBeresford/retrom/compare/retrom-v0.7.13...retrom-v0.7.14) - 2025-02-26

### Bug Fixes
- prioritize existing match in metadata update

    When downloading metadata for your library w/ the
    overwrite option, existing matches will be preserved.




## [0.7.13](https://github.com/JMBeresford/retrom/compare/retrom-v0.7.12...retrom-v0.7.13) - 2025-02-23

### Newly Added
- clean library job

    You can now trigger a "Clean Library" job which
    will prune your Retrom database of items with
    missing files/and or directories.

    fixes [#214](https://github.com/JMBeresford/retrom/pull/214)



- include screenshots in metadata

    Game metadata will now include screenshots, in addition
    to the existing artworks and videos



- opt-in overwriting in download metadata job

    The download metadata job now defaults to downloading
    metadata only for entries with no existing metadata.

    You can still optionally opt in to overwriting existing entries.




## [0.7.12](https://github.com/JMBeresford/retrom/compare/retrom-v0.7.11...retrom-v0.7.12) - 2025-02-18

### Bug Fixes
- various launcher behaviors

    You can now launch game files not at the root of
    the game's directory.

    Standalone mode no longer needs to 'install' games
    to launch them



- don't launch directories as fallback

    When launching a game w/ no default file set, the
    launcher will no longer consider directories when
    resolving a fallback file to launch





### Newly Added
- Custom library structures

    You can now define custom library structures
    if the existing Single-File Game and Multi-File
    Game options are not flexible enough!

    resolves [#104](https://github.com/JMBeresford/retrom/pull/104)




## [0.7.11](https://github.com/JMBeresford/retrom/compare/retrom-v0.7.10...retrom-v0.7.11) - 2025-02-11

### Newly Added
- UI tweaks

- default profiles for newly added emulators

- better default emulator visibility

    The desktop client now lists the default emulator and
    profile, where applicable, under the play button.

    Additionally, you can now launch a game in any valid
    emulator via the dropdown menu next to the play button.
    This is useful for games that may want to opt-out of the
    defaults.




## [0.7.10](https://github.com/JMBeresford/retrom/compare/retrom-v0.7.9...retrom-v0.7.10) - 2025-02-10

### Bug Fixes
- relative path ignore patterns


## [0.7.9](https://github.com/JMBeresford/retrom/compare/retrom-v0.7.8...retrom-v0.7.9) - 2025-02-10

### Newly Added
- Ignore Patterns

    You can now configure Retrom to ignore certain files and directories
    that match a given pattern or set of patterns, using
    *regular expressions*. This can be done in the
    `File > Server > Content Directories` menu -- read more about this in the
    [docs](https://github.com/JMBeresford/retrom/wiki/Configuration#ignore-patterns)




## [0.7.8](https://github.com/JMBeresford/retrom/compare/retrom-v0.7.7...retrom-v0.7.8) - 2025-02-09

### Bug Fixes
- memory usage in extra metadata job

- service logs


## [0.7.7](https://github.com/JMBeresford/retrom/compare/retrom-v0.7.6...retrom-v0.7.7) - 2025-02-03

### Bug Fixes
- *(docker)* npm permission issues



### Newly Added
- UI tweaks


## [0.7.6](https://github.com/JMBeresford/retrom/compare/retrom-v0.7.5...retrom-v0.7.6) - 2025-02-02

### Bug Fixes
- *(docker)* corepack keyid error

    Fixes [#250](https://github.com/JMBeresford/retrom/pull/250)





### Newly Added
- connectivity indicator


## [0.7.5](https://github.com/JMBeresford/retrom/compare/retrom-v0.7.4...retrom-v0.7.5) - 2025-02-01

### Bug Fixes
- open installation directory menu item



### Newly Added
- change installation directory

    You can now change Retrom's installation directory
    via the `File > Configuration` menu in the `Client`
    tab




## [0.7.4](https://github.com/JMBeresford/retrom/compare/retrom-v0.7.3...retrom-v0.7.4) - 2025-02-01

### Newly Added
- open installation directories from client

    The client now has a menu item under `File > Locations`
    that will open the global Retrom installation directory.

    There is also now an option to open an installed game's
    installation directory in the dropdown menu on the game's
    page.




## [0.7.3](https://github.com/JMBeresford/retrom/compare/retrom-v0.7.2...retrom-v0.7.3) - 2025-01-27

### Bug Fixes
- large library jobs no longer block client


## [0.7.2](https://github.com/JMBeresford/retrom/compare/retrom-v0.7.1...retrom-v0.7.2) - 2025-01-26

### Bug Fixes
- ignore missing steam dir


## [0.7.1](https://github.com/JMBeresford/retrom/compare/retrom-v0.7.0...retrom-v0.7.1) - 2025-01-25

### Bug Fixes
- hide empty third party libraries

    Empty third party libraries, such as Steam, will now be
    hidden in the side-bar.



- persist web client config

    The web client will now properly save changes to the
    client configuration.




## [0.7.0](https://github.com/JMBeresford/retrom/compare/retrom-v0.6.0...retrom-v0.7.0) - 2025-01-22

### Bug Fixes
- *(docker)* create DB dir

    The directory for the embedded database in the retrom
    Docker container has changed from `/app/data` to `/app/data/db`.

    For those using the embedded DB ( i.e. not using an external PostgreSQL
    DB ), you may notice that your data is missing. Follow the
    [migration guide](https://github.com/JMBeresford/retrom/wiki/Migration-Guides#v070)
    in order to retain your existing data



- manual metadata edit

    The manual metadata edit modal now properly updates
    the game metadata with valid changes.

    fixes [#230](https://github.com/JMBeresford/retrom/pull/230)



- display empty platform entries

- default to filename in IGDB search

    fixes [#231](https://github.com/JMBeresford/retrom/pull/231)



- *(file-explorer)* allow navigating to root

    The file explorer will now allow you to navigate to
    the root directory





### Newly Added
- delete platform entries

    You can now delete platform entries from the client

    resolves [#101](https://github.com/JMBeresford/retrom/pull/101)




## [0.6.0](https://github.com/JMBeresford/retrom/compare/retrom-v0.5.4...retrom-v0.6.0) - 2025-01-16

### Bug Fixes
- *(docker)* root-less docker container

    The docker container now runs under the `retrom` user again.




## [0.5.4](https://github.com/JMBeresford/retrom/compare/retrom-v0.5.3...retrom-v0.5.4) - 2025-01-16

### Bug Fixes
- *(docker)* better default permissions


## [0.5.2](https://github.com/JMBeresford/retrom/compare/retrom-v0.5.1...retrom-v0.5.2) - 2025-01-15

### Bug Fixes
- create config directory if needed

    On certain OSs, the app's config directory needs to be manually
    created. Retrom will no longer crash on startup on these systems.




## [0.5.1](https://github.com/JMBeresford/retrom/compare/retrom-v0.5.0...retrom-v0.5.1) - 2025-01-14

### Fixes
- config and embedded db fixes

- web UI not loading


## [0.5.0](https://github.com/JMBeresford/retrom/compare/retrom-v0.4.10...retrom-v0.5.0) - 2025-01-14

### Fixes
- don't resize window on web



### New
- [**breaking**] standalone support

    The Retrom service can now be run with its own
    internal database, rather than relying on an
    external one.



- Configure libraries from the client

    You can now modify your library configurations, such as
    folder location and structure, directly from the client.

    This means that just about the entire server config can be managed
    from the client now. No more manually mucking around with `json`
    files on the server!



- Standalone mode

    Retrom can now spin up and manage its own server
    locally via standalone mode. No more complicated
    server installation needed!




## [0.4.10](https://github.com/JMBeresford/retrom/compare/retrom-v0.4.9...retrom-v0.4.10) - 2024-12-28

### Fixes
- UI tweaks



### New
- persist window size and position

    Retrom will now remember window state when
    closed and re-opened.

    resolves [#145](https://github.com/JMBeresford/retrom/pull/145)




## [0.4.9](https://github.com/JMBeresford/retrom/compare/retrom-v0.4.8...retrom-v0.4.9) - 2024-12-24

### Fixes
- make steam config optional

    The update library job will no longer error when
    the optional steam config is not specified.




## [0.4.8](https://github.com/JMBeresford/retrom/compare/retrom-v0.4.7...retrom-v0.4.8) - 2024-12-15

### Fixes
- IPC communications

    An upstream dependency used to (de)serialize JSON between various
    layers of Retrom introduced a regression that broke certain
    functionalities. As a consequence of this, the server config
    file now uses camelCase as is standard for JSON. Existing configs
    will continue to work.




## [0.4.7](https://github.com/JMBeresford/retrom/compare/retrom-v0.4.6...retrom-v0.4.7) - 2024-12-13

### Fixes
- UI Tweaks



### New
- config panel

    You can now configure certain server and client settings
    from the File > Config menu item.




## [0.4.6](https://github.com/JMBeresford/retrom/compare/retrom-v0.4.5...retrom-v0.4.6) - 2024-12-01

### Fixes
- Fullscreen action button

    The Play/Install/Download button in the fullscreen layout
    now correctly responds to gamepad input.



- link rendering in changelog



### New
- steam integration

    You can now opt-in to populate your library with your Steam games. This is
    done by adding your Steam config to the service config file.



- scanned games are matched by platform

    Library scans will now take a games platform into account when matching
    via IGDB.



- prioritize exact matches in IGDB search by default

    fixes [#168](https://github.com/JMBeresford/retrom/pull/168)



- Fullscreen game list names

    Fullscreen mode now shows the names of the games in the grid view,
    where applicable.




## [0.4.5](https://github.com/JMBeresford/retrom/compare/retrom-v0.4.4...retrom-v0.4.5) - 2024-11-22

### Fixes
- don't show empty platforms in fullscreen mode

    resolves [#182](https://github.com/JMBeresford/retrom/pull/182)



- EGL Bad Parameter error on some devices


## [0.4.4](https://github.com/JMBeresford/retrom/compare/retrom-v0.4.3...retrom-v0.4.4) - 2024-11-19

### Fixes
- better handle certain networking configs

    Networking configurations that do not support the GRPC protocol are now
    supported.




## [0.4.3](https://github.com/JMBeresford/retrom/compare/retrom-v0.4.2...retrom-v0.4.3) - 2024-11-19

### Fixes
- UI Tweaks

    Fullscreen mode menus now work properly on smaller screen sizes.
    Navigation via gamepad/hotkeys in fullscreen mode is now more intuitive.
    Fullscreen mode now sorts platforms alphabetically.




## [0.4.2](https://github.com/JMBeresford/retrom/compare/retrom-v0.4.1...retrom-v0.4.2) - 2024-11-17

### Fixes
- auto-updating



### New
- announcement system

    Retrom now has an announcement system that can be used to display
    important messages without requiring a new release. This is useful for
    getting notified about breakages in current versions or new features
    that are available.



- fullscreen game page overhaul

    The game page in fullscreen mode was unfortunately prone to bugs and
    inconsistencies on various screen sizes. This overhaul cleans up the UI
    to make it more compatible with different screen sizes and resolutions,
    and to make it more intuitive to use.




## [0.4.1](https://github.com/JMBeresford/retrom/compare/retrom-v0.4.0...retrom-v0.4.1) - 2024-11-13

### Fixes
- home screen scrolling to bottom

    The home screen no longer scrolls to the bottom of the page on
    initial load.




## [0.4.0](https://github.com/JMBeresford/retrom/compare/retrom-v0.3.3...retrom-v0.4.0) - 2024-11-11

### New
- initial gamepad support

    Retrom now supports most Xbox and PlayStation controllers
- [**breaking**] fullscreen mode ([#173](https://github.com/JMBeresford/retrom/pull/173))

    Fullscreen mode now available in the `View` menu item
## [0.3.3](https://github.com/JMBeresford/retrom/compare/retrom-v0.3.2...retrom-v0.3.3) - 2024-11-08

### New
- indicate installation status in side bar

    Installed games are now highlighted in the side bar. They are also
    grouped together at the top of the list with an option to opt-out of
    this behavior.
## [0.3.2](https://github.com/JMBeresford/retrom/compare/retrom-v0.3.1...retrom-v0.3.2) - 2024-10-26

### Fixes
- MultiFileGame installations
## [0.3.1](https://github.com/JMBeresford/retrom/compare/retrom-v0.3.0...retrom-v0.3.1) - 2024-10-24

### Fixes
- sub-directories in game files

    Any sub-directories in a MultiFileGame's directory is now properly
    scanned and added to the game's file list. Installing such games from
    the desktop client now works as expected, as does downloading them from
    the web client.
- UI Tweaks

    Updated changlog to look _more prettier_

### New
- allow deleted games to be re-imported

    Now when deleting a game, blacklisting it from future library scans is
    optional. This is useful for games that have malformed data and need to
    be reset completely.
## [0.3.0](https://github.com/JMBeresford/retrom/compare/retrom-v0.2.8...retrom-v0.3.0) - 2024-10-21

### Added
- [**breaking**] shared emulator profiles

    Emulators are no longer scoped to a single client. Any per-client
    configuration is now distinct from the emulators -- and, by extension,
    their profiles -- themselves. This means that profiles can now be used
    across clients!
## [0.2.8](https://github.com/JMBeresford/retrom/compare/retrom-v0.2.7...retrom-v0.2.8) - 2024-10-21

### Added
- `install_dir` macro for custom args

    Now you can use the `install_dir` macro in your profile's custom args to
    specify the installation directory for the game. This will allow you
    launch multi-file games with emulators that require a directory of
    files ( e.g. RPCS3 ).
## [0.2.7](https://github.com/JMBeresford/retrom/compare/retrom-v0.2.6...retrom-v0.2.7) - 2024-10-17

### Fixed
- installed games filenames

    Installing games now properly omit's any quotes that wrap the filename,
    fixing the issue where games could not be installed on windows.

    Additionally, filenames now no longer strip the file extension.
## [0.2.6](https://github.com/JMBeresford/retrom/compare/retrom-v0.2.5...retrom-v0.2.6) - 2024-10-17

### Fixed
- creating log file

    Retrom now checks to make sure the log directory exists before
    trying to create a log file. It also places the log file in the
    OS-specific idiomatic location for log files.
## [0.2.5](https://github.com/JMBeresford/retrom/compare/retrom-v0.2.4...retrom-v0.2.5) - 2024-10-17

### Added
- client log file
## [0.2.4](https://github.com/JMBeresford/retrom/compare/retrom-v0.2.3...retrom-v0.2.4) - 2024-10-15

### Fixed
- *(Web Client)* Fix downloading games w/ commas in name

    Downloading games with commas in the file name now works as expected,
    rather than failing with a `Multiple Content-Disposition` error.
## [0.2.3](https://github.com/JMBeresford/retrom/compare/retrom-v0.2.2...retrom-v0.2.3) - 2024-10-13

### Fixed
- emulator save strategy dropdown

    The dropdown will now properly reset the rendered value when an emulator
    is added.
- *(client)* indent changelog bodies
## [0.2.2](https://github.com/JMBeresford/retrom/compare/retrom-v0.2.1...retrom-v0.2.2) - 2024-10-13

### Fixed
- *(client)* render new version number correctly

    The new version number in the update modal will now be rendered correctly,
    rather than render `[object Object]`.

## [0.2.1](https://github.com/JMBeresford/retrom/compare/retrom-v0.2.0...retrom-v0.2.1) - 2024-10-11

### Fixed

- _(service)_ better error logs
- _(web client)_ use service port defined in config file

## [0.2.0](https://github.com/JMBeresford/retrom/compare/retrom-v0.1.13...retrom-v0.2.0) - 2024-10-10

### Fixed

- per-client default emulator profiles
- default profiles modal UI tweaks

## [0.1.13](https://github.com/JMBeresford/retrom/compare/retrom-v0.1.12...retrom-v0.1.13) - 2024-10-01

### Added

- version modals added to menubar

### Fixed

- UI tweaks
- semantics of manual metadata update modal

## [0.1.12](https://github.com/JMBeresford/retrom/compare/retrom-v0.1.11...retrom-v0.1.12) - 2024-09-30

### Added

- UI tweaks
- sort by time played + sort fixes

### Fixed

- _(web client)_ download button

## [0.1.10](https://github.com/JMBeresford/retrom/compare/retrom-v0.1.9...retrom-v0.1.10) - 2024-09-27

### Added

- web client bundled with service docker image ([#134](https://github.com/JMBeresford/retrom/pull/134))

## [0.1.9](https://github.com/JMBeresford/retrom/compare/retrom-v0.1.8...retrom-v0.1.9) - 2024-09-27

### Fixed

- game name rendering

## [0.1.8](https://github.com/JMBeresford/retrom/compare/retrom-v0.1.7...retrom-v0.1.8) - 2024-09-27

### Fixed

- restore legacy content dir + fix config loading

## [0.1.7](https://github.com/JMBeresford/retrom/compare/retrom-v0.1.6...retrom-v0.1.7) - 2024-09-26

### Added

- _(client)_ opt-out of platform filtering in IGDB searching

### Fixed

- _(service)_ no longer relies on default config file
- _(client)_ render single-file game names with dots
- _(client)_ render multi-file game names with dots

## [0.1.6](https://github.com/JMBeresford/retrom/compare/retrom-v0.1.5...retrom-v0.1.6) - 2024-09-26

### Fixed

- game details UI tweaks
- idle job text is correct color

## [0.1.5](https://github.com/JMBeresford/retrom/compare/retrom-v0.1.4...retrom-v0.1.5) - 2024-09-26

### Fixed

- extra metadata job

## [0.1.4](https://github.com/JMBeresford/retrom/compare/retrom-v0.1.3...retrom-v0.1.4) - 2024-09-25

### Fixed

- external links
- better similar games searching

## [0.1.3](https://github.com/JMBeresford/retrom/compare/retrom-v0.1.2...retrom-v0.1.3) - 2024-09-24

### Fixed

- sidebar tooltips no longer block cursor

## [0.1.2](https://github.com/JMBeresford/retrom/compare/retrom-v0.1.1...retrom-v0.1.2) - 2024-09-24

### Fixed

- fallback to deprecated CONTENT_DIR envvar
- sidebar sorting

## [0.1.1](https://github.com/JMBeresford/retrom/compare/retrom-v0.1.0...retrom-v0.1.1) - 2024-09-24

### Added

- search and sort sidebar entries

## [0.1.0](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.81...retrom-v0.1.0) - 2024-09-22

### Added

- [**breaking**] allow single file lib structure

## [0.0.81](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.80...retrom-v0.0.81) - 2024-09-22

### Added

- warn on breaking changes

## [0.0.80](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.79...retrom-v0.0.80) - 2024-09-18

### Fixed

- custom arg parsing
- emulator profile modal width

## [0.0.79](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.78...retrom-v0.0.79) - 2024-09-16

### Fixed

- match games by igdb ID

## [0.0.78](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.77...retrom-v0.0.78) - 2024-09-15

### Fixed

- tls in launcher plugin

## [0.0.77](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.76...retrom-v0.0.77) - 2024-09-13

### Fixed

- emulator modal file picker

## [0.0.76](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.75...retrom-v0.0.76) - 2024-09-13

### Fixed

- static link libpq

## [0.0.75](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.74...retrom-v0.0.75) - 2024-09-13

### Fixed

- doc links + UI tweaks

## [0.0.74](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.73...retrom-v0.0.74) - 2024-09-11

### Fixed

- 64-bit nums

## [0.0.73](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.72...retrom-v0.0.73) - 2024-09-11

### Fixed

- macOS entitlements for notarization

## [0.0.72](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.71...retrom-v0.0.72) - 2024-09-08

### Fixed

- macOS build signing

## [0.0.71](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.70...retrom-v0.0.71) - 2024-09-08

### Added

- refresh data on metadata job done

## [0.0.70](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.69...retrom-v0.0.70) - 2024-09-05

### Added

- modal refactor

## [0.0.69](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.68...retrom-v0.0.69) - 2024-09-05

### Fixed

- sync config on desktop app

## [0.0.65](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.64...retrom-v0.0.65) - 2024-09-04

### Fixed

- updating -> relaunching

## [0.0.64](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.63...retrom-v0.0.64) - 2024-09-04

### Fixed

- _(macOS)_ app identifier

## [0.0.63](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.62...retrom-v0.0.63) - 2024-09-04

### Fixed

- no more node server

## [0.0.62](https://github.com/JMBeresford/retrom/compare/retrom-v0.0.61...retrom-v0.0.62) - 2024-09-03

### Fixed

- nothing
