import { useEffect, useReducer } from 'react';
import {
  DyteProvider,
  useDyteClient,
  useDyteMeeting,
  useDyteSelector,
} from '@dytesdk/react-web-core';
import {
  DyteAudioVisualizer,
  DyteAvatar,
  DyteCameraToggle,
  DyteChatToggle,
  DyteControlbar,
  DyteDialogManager,
  DyteGrid,
  DyteHeader,
  DyteLeaveButton,
  DyteLogo,
  DyteMeetingTitle,
  DyteMicToggle,
  DyteMoreToggle,
  DyteMuteAllButton,
  DyteNameTag,
  DyteParticipantTile,
  DyteParticipantsAudio,
  DytePipToggle,
  DytePluginsToggle,
  DytePollsToggle,
  DyteRecordingToggle,
  DyteScreenShareToggle,
  DyteScreenshareView,
  DyteSettings,
  DyteSettingsToggle,
  DyteSetupScreen,
  DyteSidebar,
  DyteSimpleGrid,
  DyteSpinner,
  defaultConfig,
  provideDyteDesignSystem,
} from '@dytesdk/react-ui-kit';

const config = { ...defaultConfig };

if (config.root) {
  config.root['dyte-participant-tile'] = (
    config.root['dyte-participant-tile'] as any
  ).children;
}


function Meeting() {
  const { meeting } = useDyteMeeting();
  const roomJoined = useDyteSelector((m) => m.self.roomJoined);
  const participants = useDyteSelector((m) => m.participants.active);
  const screenShareEnabled = useDyteSelector((m) => m.self.screenShareEnabled);
  const joinedParticipants = useDyteSelector((m) =>
    m.participants.joined.toArray()
  );

  const activeScreenShares = joinedParticipants.filter(
    (p) => p.screenShareEnabled
  );

  meeting.participants.pip.init();

  const screenshares = screenShareEnabled
  ? [...activeScreenShares, meeting.self]
  : activeScreenShares;

  const [states, updateStates] = useReducer(
    (state: any, payload: any) => ({
      ...state,
      ...payload,
    }),
    { meeting: 'joined', activeSidebar: false },
  );

  if (!meeting) {
    return <DyteSpinner />;
  }

  if (!roomJoined) {
    return <DyteSetupScreen meeting={meeting} />;
  }
  return (

    // the below is the main div where our whole DyteMeeting will be displayed, the whole meeting
    // is wrapped inside a div, and all the DyteStateUpdates emitted in the meeting are been listened here 
    <div
      className="flex flex-col w-full h-full"
      // ref={(el) => {
      //   el?.addEventListener('dyteStateUpdate', (e: any) => {
      //     console.log(e);
      //     updateStates(e.detail);
      //   });
      // }}
    >
      {/* <header className="flex items-center gap-3 h-12 border-b w-full px-2 text-sm">
        <DyteLogo meeting={meeting} />
        <DyteMeetingTitle meeting={meeting} />
      </header> */}

      <DyteHeader meeting={meeting} states={states} className="flex items-center gap-3 h-12 border-b w-full px-2 text-sm"/>

      <main className="flex flex-1 p-2">
      <DyteParticipantsAudio meeting={meeting}/> {/** this is used to able to hear the audio in the meeting */}

        {/* the below is used to render all the other participants except us in the meeting */}

        <DyteSimpleGrid
            states={states}
            participants={participants.toArray()}
            meeting={meeting}
            aspectRatio="1:1"
            gap={18}
          />
        
        {/* the below is used to render the screenshare video in meeting, the reason we are only showing screenshares[0] (participant) 's video
        because in our meeting max to max only 1 user is able to share the screen */}

          {screenshares.length > 0 && 
          <DyteScreenshareView meeting={meeting} participant={screenshares[0]} style={{ height: '480px' }} onDyteStateUpdate={(e) => {console.log(e)}}>
            <DyteNameTag participant={screenshares[0]}>
              <DyteAudioVisualizer slot="start" participant={screenshares[0]} />
            </DyteNameTag>
          </DyteScreenshareView>}

          
          {/* the below is the self user screen, we have used tailwind css to make the display like a whatsapp video call */}


          <DyteParticipantTile
          config={config}
          participant={meeting.self}
          meeting={meeting}
          key={meeting.self.id}
          className="z-10 absolute bottom-44 right-4 sm:bottom-4 shadow-black shadow-2xl aspect-square w-52 h-auto cursor-move duration-0"
        >
          <DyteAvatar participant={meeting.self} size="md" />
          <DyteNameTag participant={meeting.self} size="md">
            <DyteAudioVisualizer
              participant={meeting.self}
              size="md"
              slot="start"
            />
          </DyteNameTag>
        </DyteParticipantTile>
        {/* <DyteGrid meeting={meeting} config={config}/> */}
        {states.activeSidebar && <DyteSidebar meeting={meeting} states={states} onDyteStateUpdate={(e) => {console.log(e); updateStates(e.detail)}}/>}
      </main>

      {/* the below section is the control bar section, here every button click emits a DyteStateUpdate which we listen and based on that events, 
      screens are rendered and other things */}

      <footer className="p-2 flex place-items-center justify-center">


        <DyteMicToggle meeting={meeting} onDyteStateUpdate={(e) => {console.log(e); updateStates(e.detail)}}/>
        <DyteCameraToggle meeting={meeting} onDyteStateUpdate={(e) => {console.log(e); updateStates(e.detail)}}/>  
        <DyteScreenShareToggle states={states} meeting={meeting} onDyteStateUpdate={(e) => {console.log(e); updateStates(e.detail)}}/>
        <DytePluginsToggle states={states} meeting={meeting} onDyteStateUpdate={(e) => {console.log(e); updateStates(e.detail)}}/>
        <DyteSettingsToggle states={states} onDyteStateUpdate={(e) => {console.log(e); updateStates(e.detail)}}/>
        <DyteMoreToggle states={states} onDyteStateUpdate={(e) => {console.log(e); updateStates(e.detail)}}>
          <div slot="more-elements">
              <DytePipToggle meeting={meeting} states={states} variant='horizontal'/>
              <DyteMuteAllButton meeting={meeting} variant='horizontal'/>
              <DyteRecordingToggle meeting={meeting} variant='horizontal'/>
          </div>
        </DyteMoreToggle>
        <DyteLeaveButton onDyteStateUpdate={(e) => {console.log(e); updateStates(e.detail)}}/>
        <DyteDialogManager states={states} meeting={meeting} onDyteStateUpdate={(e) => {console.log(e); updateStates(e.detail)}}/>

        {/* DyteDialogManager is required whenever a dialog should be rendered on click of the button like the Leave button, Settings button */}


      </footer>
      {/* <DyteControlbar meeting={meeting} states={states} className="p-2 flex place-items-center justify-center"/>
      <DyteDialogManager states={states} meeting={meeting}/> */}
    </div>
  );
}

function App() {
  const [meeting, initMeeting] = useDyteClient();

  useEffect(() => {
    const searchParams = new URL(window.location.href).searchParams;

    const authToken = searchParams.get('authToken');

    if (!authToken) {
      alert(
        "An authToken wasn't passed, please pass an authToken in the URL query to join a meeting.",
      );
      return;
    }

    provideDyteDesignSystem(document.body, {
      theme: 'light',
    });

    initMeeting({
      authToken,
      defaults: {
        audio: false,
        video: false,
      },
    }).then((m) => m?.joinRoom());
  }, []);

  // By default this component will cover the entire viewport.
  // To avoid that and to make it fill a parent container, pass the prop:
  // `mode="fill"` to the component.
  return (
    <DyteProvider value={meeting}>
      <Meeting />
    </DyteProvider>
  );
}

export default App;
