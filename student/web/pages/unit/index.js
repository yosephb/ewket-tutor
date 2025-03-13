import UnitListItem from '../../components/UnitListItem';

{units.map((unit, index) => (
  <UnitListItem
    key={index}
    course={course}
    unit={unit.title}
    topicCount={unit.topicCount}
  />
))} 