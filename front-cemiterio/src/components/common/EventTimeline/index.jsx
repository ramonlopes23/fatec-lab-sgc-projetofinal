import {
    TimelineBody,
    TimelineDot,
    TimelineEmpty,
    TimelineItem,
    TimelineLabel,
    TimelineMeta,
    TimelineRail,
    TimelineRoot,
    TimelineText,
} from "./styles";

export default function EventTimeline({ items = [], emptyText = "Nenhum evento registrado." }) {
    if (!items.length) {
        return <TimelineEmpty>{emptyText}</TimelineEmpty>;
    }

    return (
        <TimelineRoot>
            {items.map((item, index) => (
                <TimelineItem key={item.id || `${item.label}-${index}`}>
                    {index < items.length - 1 ? <TimelineRail /> : null}
                    <TimelineDot $tone={item.tone} />
                    <TimelineBody>
                        <TimelineLabel>{item.label}</TimelineLabel>
                        <TimelineText>{item.text}</TimelineText>
                        {item.meta ? <TimelineMeta>{item.meta}</TimelineMeta> : null}
                    </TimelineBody>
                </TimelineItem>
            ))}
        </TimelineRoot>
    );
}
